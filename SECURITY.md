# 🔒 Guía de Seguridad - Barreto Construcciones

## Medidas de Seguridad Implementadas

### ✅ Headers HTTP Seguros (OWASP)
- **CSP** (Content Security Policy)
- **HSTS** (HTTP Strict Transport Security)
- **X-Frame-Options** (Clickjacking protection)
- **X-Content-Type-Options** (MIME sniffing protection)
- **Referrer-Policy**
- **Permissions-Policy**

### ✅ Protección del Formulario
- Rate Limiting (3 requests/min por IP)
- Honeypot field (anti-bots)
- Timestamp validation (anti-automation)
- reCAPTCHA v3 (invisible)
- Validación Zod (strict schemas)
- Spam keyword detection
- XSS sanitization
- Input length restrictions

### ✅ Dependencias
- Sin vulnerabilidades conocidas (audit: ✅)
- Overrides configurados para seguridad
- Actualizaciones automáticas recomendadas

## Variables de Entorno Requeridas

Copia `.env.example` a `.env` y configura:

```env
# Resend API (Email service)
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=contacto@tudominio.com
EMAIL_TO=tu-email@ejemplo.com

# reCAPTCHA v3
RECAPTCHA_SECRET_KEY=your_secret_key
PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
```

## Comandos de Seguridad

```bash
# Auditar dependencias
pnpm audit

# Actualizar dependencias
pnpm update --latest

# Verificar tipos
pnpm astro check

# Build para producción
pnpm build
```

## Configuración de reCAPTCHA

1. Ve a https://www.google.com/recaptcha/admin
2. Crea un nuevo sitio (reCAPTCHA v3)
3. Añade tus dominios:
   - `localhost` (desarrollo)
   - `tudominio.com` (producción)
4. Copia las claves a `.env`

## Despliegue en Vercel

### Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade todas las variables del `.env`
4. Marca cada variable según el entorno:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Headers de Seguridad

Los headers están configurados en `src/middleware.ts` y se aplican automáticamente.

## Monitoreo

### Logs de Seguridad

El sistema loguea automáticamente:
- Rate limit violations
- Honeypot triggers
- Spam attempts
- reCAPTCHA failures
- Form anomalies

Revisa los logs en Vercel Dashboard → Logs

### Recomendaciones

Para producción, considera integrar:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Upstash Redis** - Rate limiting persistente

## Mantenimiento

### Checklist Mensual

- [ ] Ejecutar `pnpm audit`
- [ ] Revisar logs de Vercel
- [ ] Verificar rate limiting stats
- [ ] Actualizar dependencias
- [ ] Revisar score de reCAPTCHA

### Incidentes de Seguridad

Si detectas actividad sospechosa:

1. Revisa logs en Vercel
2. Bloquea IPs si es necesario
3. Ajusta rate limiting
4. Revisa configuración de reCAPTCHA
5. Documenta el incidente

## Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Astro Security](https://docs.astro.build/en/guides/security/)
- [reCAPTCHA Docs](https://developers.google.com/recaptcha/docs/v3)
- [Resend Docs](https://resend.com/docs)

## Auditoría Completa

Consulta `SECURITY_AUDIT.md` para el análisis detallado de seguridad OWASP.

---

**Score de Seguridad:** 100/100 ✅  
**Última Auditoría:** 18 de Noviembre de 2025  
**Vulnerabilidades Conocidas:** 0
