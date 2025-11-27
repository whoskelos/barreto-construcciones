import type { APIRoute } from 'astro';
import {
  contactFormSchema,
  checkRateLimit,
  containsSpam,
  verifyRecaptcha
} from '../../lib/security';
import { sendContactEmail, sendAutoResponseEmail } from '../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. Verify Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data') && !contentType?.includes('application/x-www-form-urlencoded')) {
      return new Response(JSON.stringify({ success: false, message: 'Tipo de contenido no válido' }), { status: 400 });
    }

    // 2. Rate Limiting
    const ip = clientAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.'
      }), { status: 429, headers: { 'Retry-After': '60' } });
    }

    // 3. Get Data
    const formData = await request.formData();
    const rawData = {
      nombre: formData.get('nombre')?.toString() || '',
      apellido: formData.get('apellido')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      telefono: formData.get('telefono')?.toString() || '',
      asunto: formData.get('asunto')?.toString() || '',
      mensaje: formData.get('mensaje')?.toString() || '',
      website: formData.get('website')?.toString() || '',
      timestamp: formData.get('timestamp')?.toString() || '',
    };

    // 4. Honeypot Check
    if (rawData.website) {
      console.warn('Honeypot triggered:', ip);
      return new Response(JSON.stringify({ success: true, message: '¡Mensaje enviado correctamente!' }), { status: 200 });
    }

    // 5. Speed Submission Check
    if (rawData.timestamp) {
      const submissionTime = Date.now();
      const formLoadTime = parseInt(rawData.timestamp, 10);
      if (submissionTime - formLoadTime < 3000) {
        console.warn('Form submitted too quickly:', ip);
        return new Response(JSON.stringify({ success: false, message: 'Por favor, tómate tu tiempo para completar el formulario.' }), { status: 400 });
      }
    }

    // 6. Zod Validation
    const validationResult = contactFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => err.message).join(', ');
      return new Response(JSON.stringify({ success: false, message: errors }), { status: 400 });
    }

    const validData = validationResult.data;

    // 7. Spam Detection
    if (containsSpam(validData.mensaje) || containsSpam(validData.asunto)) {
      console.warn('Spam detected:', ip);
      return new Response(JSON.stringify({ success: false, message: 'Tu mensaje contiene contenido no permitido.' }), { status: 400 });
    }

    // 8. Logic Validation (Email or Phone required)
    if (!validData.email && !validData.telefono) {
      return new Response(JSON.stringify({ success: false, message: 'Por favor, proporciona al menos un email o un teléfono.' }), { status: 400 });
    }

    // 9. reCAPTCHA Verification
    const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    if (!isLocalhost) {
      const token = formData.get('recaptcha_token')?.toString();
      if (!token) {
        return new Response(JSON.stringify({ success: false, message: 'Error de verificación de seguridad.' }), { status: 400 });
      }

      const { success, score } = await verifyRecaptcha(token, import.meta.env.RECAPTCHA_SECRET_KEY);

      if (!success || (score !== undefined && score < 0.5)) {
        console.warn('reCAPTCHA failed:', { success, score, ip });
        return new Response(JSON.stringify({ success: false, message: 'No hemos podido verificar que eres humano.' }), { status: 400 });
      }
    }

    // 10. Send Email
    const emailResult = await sendContactEmail(validData);
    if (!emailResult.success) {
      return new Response(JSON.stringify({ success: false, message: 'Hubo un error al enviar tu mensaje.' }), { status: 500 });
    }

    // 11. Send Auto-response (Fire and forget)
    if (validData.email) {
      sendAutoResponseEmail(validData).catch(err => {
        console.error('Failed to send auto-response:', err);
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: '¡Mensaje enviado correctamente! Te responderemos lo antes posible.',
      emailId: emailResult.id
    }), { status: 200 });

  } catch (error) {
    console.error('Unexpected API error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Ocurrió un error inesperado.' }), { status: 500 });
  }
};
