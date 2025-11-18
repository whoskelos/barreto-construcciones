import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { z } from 'zod';

// Inicializar Resend con la API key
const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const prerender = false;

// Schema de validación con Zod (siguiendo estándares OWASP)
const contactFormSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'El nombre contiene caracteres no válidos')
    .trim(),
  
  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'El apellido contiene caracteres no válidos')
    .trim(),
  
  email: z.string()
    .email('El formato del email no es válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  telefono: z.string()
    .regex(/^[\d\s+()-]*$/, 'El teléfono contiene caracteres no válidos')
    .min(9, 'El teléfono debe tener al menos 9 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  
  asunto: z.string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(100, 'El asunto no puede exceder 100 caracteres')
    .trim(),
  
  mensaje: z.string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede exceder 2000 caracteres')
    .trim(),
  
  // Campo honeypot (trampa para bots)
  website: z.string().max(0).optional(),
  
  // Timestamp para detectar envíos muy rápidos
  timestamp: z.string().optional(),
});

// Lista de palabras spam comunes (detección básica)
const spamKeywords = [
  'viagra', 'cialis', 'casino', 'lottery', 'winner', 'click here',
  'buy now', 'limited time', 'act now', 'congratulations',
];

// Función para detectar spam
function containsSpam(text: string): boolean {
  const lowerText = text.toLowerCase();
  return spamKeywords.some(keyword => lowerText.includes(keyword));
}

// Función para sanitizar HTML (prevenir XSS)
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting simple (en producción usar Redis)
const requestTimestamps = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(ip) || [];
  
  // Filtrar timestamps de los últimos 60 segundos
  const recentTimestamps = timestamps.filter(t => now - t < 60000);
  
  // Máximo 3 solicitudes por minuto
  if (recentTimestamps.length >= 3) {
    return false;
  }
  
  recentTimestamps.push(now);
  requestTimestamps.set(ip, recentTimestamps);
  
  // Limpiar entradas antiguas (más de 5 minutos)
  if (requestTimestamps.size > 1000) {
    for (const [key, times] of requestTimestamps.entries()) {
      if (times.every(t => now - t > 300000)) {
        requestTimestamps.delete(key);
      }
    }
  }
  
  return true;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. Verificar Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data') && !contentType?.includes('application/x-www-form-urlencoded')) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Tipo de contenido no válido',
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 2. Rate Limiting (OWASP: Automated Threat Prevention)
    const ip = clientAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.',
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    // 3. Obtener y validar datos del formulario
    const formData = await request.formData();
    const rawData = {
      nombre: formData.get('nombre')?.toString() || '',
      apellido: formData.get('apellido')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      telefono: formData.get('telefono')?.toString() || '',
      asunto: formData.get('asunto')?.toString() || '',
      mensaje: formData.get('mensaje')?.toString() || '',
      website: formData.get('website')?.toString() || '', // Honeypot
      timestamp: formData.get('timestamp')?.toString() || '',
    };

    // 4. Honeypot: Si el campo "website" está lleno, es un bot
    if (rawData.website) {
      console.warn('Honeypot triggered:', ip);
      // Responder con éxito falso para no alertar al bot
      return new Response(
        JSON.stringify({
          success: true,
          message: '¡Mensaje enviado correctamente!',
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 5. Validar tiempo mínimo de llenado (humanos tardan al menos 3 segundos)
    if (rawData.timestamp) {
      const submissionTime = Date.now();
      const formLoadTime = parseInt(rawData.timestamp, 10);
      if (submissionTime - formLoadTime < 3000) {
        console.warn('Form submitted too quickly:', ip);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Por favor, tómate tu tiempo para completar el formulario.',
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // 6. Validar con Zod
    const validationResult = contactFormSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: { message: string }) => err.message).join(', ');
      return new Response(
        JSON.stringify({
          success: false,
          message: errors,
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { nombre, apellido, email, telefono, asunto, mensaje } = validationResult.data;

    // 7. Detección de spam
    if (containsSpam(mensaje) || containsSpam(asunto)) {
      console.warn('Spam detected:', ip);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Tu mensaje contiene contenido no permitido. Por favor, revisa tu texto.',
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 8. Verificar que al menos email o teléfono estén presentes
    if (!email && !telefono) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Por favor, proporciona al menos un email o un teléfono para poder contactarte.',
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 9. Verificar reCAPTCHA v3
    const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    
    if (!isLocalhost) {
      const recaptchaToken = formData.get('recaptcha_token')?.toString();
      if (!recaptchaToken) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Error de verificación. Por favor, recarga la página e inténtalo de nuevo.',
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Verificar el token con Google
      const recaptchaSecret = import.meta.env.RECAPTCHA_SECRET_KEY;
      const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
      
      try {
        const recaptchaResponse = await fetch(recaptchaVerifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
        });

        const recaptchaData = await recaptchaResponse.json();

        // Log completo para debugging
        console.log('reCAPTCHA full response:', JSON.stringify(recaptchaData, null, 2));

        // Verificar que el score sea suficiente (0.0 - 1.0, donde 1.0 es muy probablemente humano)
        if (!recaptchaData.success) {
          console.error('reCAPTCHA verification failed:', {
            success: recaptchaData.success,
            score: recaptchaData.score,
            'error-codes': recaptchaData['error-codes'],
            action: recaptchaData.action,
            ip,
          });
          
          return new Response(
            JSON.stringify({
              success: false,
              message: 'No hemos podido verificar que eres humano. Por favor, inténtalo de nuevo.',
            }),
            { 
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }

        if (recaptchaData.score < 0.5) {
          console.warn('reCAPTCHA score too low:', {
            score: recaptchaData.score,
            action: recaptchaData.action,
            ip,
          });
          
          return new Response(
            JSON.stringify({
              success: false,
              message: 'No hemos podido verificar que eres humano. Por favor, inténtalo de nuevo.',
            }),
            { 
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }

        // Log del score para análisis
        console.log('reCAPTCHA verification SUCCESS:', {
          score: recaptchaData.score,
          action: recaptchaData.action,
          ip,
        });
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        // En caso de error, permitir el envío pero loguearlo
        console.warn('Continuing without reCAPTCHA verification due to error');
      }
    } else {
      console.log('🚧 Development mode: Skipping reCAPTCHA verification for localhost');
    }

    // Construir el contenido del email en HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo mensaje de contacto</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo mensaje de contacto</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 18px;">Información del contacto</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #555; width: 120px;">Nombre:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${nombre} ${apellido}</td>
                </tr>
                ${email ? `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                </tr>
                ` : ''}
                ${telefono ? `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #555;">Teléfono:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><a href="tel:${telefono}" style="color: #667eea; text-decoration: none;">${telefono}</a></td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #555;">Asunto:</td>
                  <td style="padding: 10px;">${asunto}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #667eea; margin-top: 0; font-size: 16px;">Mensaje:</h3>
              <p style="color: #555; white-space: pre-wrap; line-height: 1.6;">${mensaje}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-left: 4px solid #667eea; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                <strong>Nota:</strong> Este mensaje fue enviado desde el formulario de contacto de barretoconstrucciones.es
              </p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Barreto Construcciones. Todos los derechos reservados.</p>
          </div>
        </body>
      </html>
    `;

    // Construir el contenido en texto plano (fallback)
    const emailText = `
NUEVO MENSAJE DE CONTACTO

Información del contacto:
-------------------------
Nombre: ${nombre} ${apellido}
${email ? `Email: ${email}` : ''}
${telefono ? `Teléfono: ${telefono}` : ''}
Asunto: ${asunto}

Mensaje:
--------
${mensaje}

---
Este mensaje fue enviado desde el formulario de contacto de barretoconstrucciones.es
    `.trim();

    // Enviar email usando Resend con reintentos y manejo de errores
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: import.meta.env.EMAIL_FROM || 'contacto@barretoconstrucciones.es',
      to: import.meta.env.EMAIL_TO || 'contacto@barretoconstrucciones.es',
      replyTo: email || undefined,
      subject: `[Web] ${asunto}`,
      html: emailHtml,
      text: emailText,
      tags: [
        { name: 'tipo', value: 'contacto' },
        { name: 'origen', value: 'web' },
      ],
    });

    // Manejar errores específicos de Resend
    if (emailError) {
      console.error('Error al enviar email:', emailError);
      
      // Errores de validación
      if (emailError.name === 'validation_error') {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Error de validación: ' + emailError.message,
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Otros errores
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.',
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Respuesta exitosa
    console.log('Email enviado exitosamente:', emailData?.id);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: '¡Mensaje enviado correctamente! Te responderemos lo antes posible.',
        emailId: emailData?.id,
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    // Error inesperado
    console.error('Error inesperado en API:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
