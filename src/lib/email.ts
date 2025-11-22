import { Resend } from 'resend';
import type { ContactFormData } from './security';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

interface EmailResult {
  success: boolean;
  id?: string;
  error?: any;
}

export async function sendContactEmail(data: ContactFormData): Promise<EmailResult> {
  const { nombre, apellido, email, telefono, asunto, mensaje } = data;

  // HTML Template
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo mensaje de contacto</title>
      </head>
      <body style="font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #18181b; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
        <div style="background-color: #ed6309; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Nuevo mensaje de contacto</h1>
          <p style="color: #fff7ed; margin: 5px 0 0 0; font-size: 14px;">Barreto Construcciones</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="margin-bottom: 25px;">
            <h2 style="color: #ea580c; margin-top: 0; font-size: 18px; border-bottom: 2px solid #fed7aa; padding-bottom: 10px; display: inline-block;">Información del contacto</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; font-weight: bold; color: #52525b; width: 120px;">Nombre:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #18181b;">${nombre} ${apellido}</td>
              </tr>
              ${email ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; font-weight: bold; color: #52525b;">Email:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4;"><a href="mailto:${email}" style="color: #ea580c; text-decoration: none; font-weight: 500;">${email}</a></td>
              </tr>
              ` : ''}
              ${telefono ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; font-weight: bold; color: #52525b;">Teléfono:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4;"><a href="tel:${telefono}" style="color: #ea580c; text-decoration: none; font-weight: 500;">${telefono}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; font-weight: bold; color: #52525b;">Asunto:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; color: #18181b;">${asunto}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fafaf9; padding: 20px; border-radius: 6px; border: 1px solid #e7e5e4;">
            <h3 style="color: #ea580c; margin-top: 0; font-size: 16px; margin-bottom: 10px;">Mensaje:</h3>
            <p style="color: #3f3f46; white-space: pre-wrap; line-height: 1.6; margin: 0;">${mensaje}</p>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background: #fff7ed; border-left: 4px solid #ed6309; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #7c2d12;">
              <strong>Nota:</strong> Este mensaje fue enviado desde el formulario de contacto de barretoconstrucciones.es
            </p>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #78716c; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Barreto Construcciones. Todos los derechos reservados.</p>
        </div>
      </body>
    </html>
  `;

  // Plain Text Template
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

  try {
    const { data: emailData, error } = await resend.emails.send({
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

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, id: emailData?.id };
  } catch (error) {
    console.error('Unexpected email error:', error);
    return { success: false, error };
  }
}
