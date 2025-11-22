import { z } from 'zod';

// --- Validation Schemas ---

export const contactFormSchema = z.object({
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
  
  // Honeypot field
  website: z.string().max(0).optional(),
  
  // Timestamp for speed submission check
  timestamp: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// --- Spam Detection ---

const spamKeywords = [
  'viagra', 'cialis', 'casino', 'lottery', 'winner', 'click here',
  'buy now', 'limited time', 'act now', 'congratulations', 'crypto', 'bitcoin'
];

export function containsSpam(text: string): boolean {
  const lowerText = text.toLowerCase();
  return spamKeywords.some(keyword => lowerText.includes(keyword));
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// --- Rate Limiting (Memory-based, temporary for Serverless) ---
// Note: In a real serverless production environment, use Redis (Upstash/Vercel KV)
const requestTimestamps = new Map<string, number[]>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(ip) || [];
  
  // Filter timestamps from the last 60 seconds
  const recentTimestamps = timestamps.filter(t => now - t < 60000);
  
  // Max 3 requests per minute
  if (recentTimestamps.length >= 3) {
    return false;
  }
  
  recentTimestamps.push(now);
  requestTimestamps.set(ip, recentTimestamps);
  
  // Cleanup old entries (older than 5 minutes)
  if (requestTimestamps.size > 1000) {
    for (const [key, times] of requestTimestamps.entries()) {
      if (times.every(t => now - t > 300000)) {
        requestTimestamps.delete(key);
      }
    }
  }
  
  return true;
}

// --- reCAPTCHA Verification ---

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(token: string, secretKey: string): Promise<{ success: boolean; score?: number }> {
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
  
  try {
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data: RecaptchaResponse = await response.json();
    return { success: data.success, score: data.score };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false };
  }
}
