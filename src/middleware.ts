import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // OWASP Security Headers
  
  // 1. Content Security Policy (CSP) - Protección contra XSS
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://va.vercel-scripts.com https://cdn.vercel-insights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://www.google.com https://www.gstatic.com https://api.resend.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspDirectives);

  // 2. X-Frame-Options - Protección contra Clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // 3. X-Content-Type-Options - Previene MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 4. Referrer-Policy - Controla información del referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 5. Permissions-Policy - Restringe APIs del navegador
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // 6. X-XSS-Protection - Protección XSS legacy (para navegadores antiguos)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 7. Strict-Transport-Security - Fuerza HTTPS (solo en producción)
  if (import.meta.env.PROD) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // 8. X-DNS-Prefetch-Control - Control de DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // 9. X-Permitted-Cross-Domain-Policies - Protección contra cross-domain
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // 10. Eliminar headers que exponen información del servidor
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  return response;
});
