# Configuración de Google Ads (Optimizado con Partytown)

Este proyecto está preparado para Google Ads, pero la integración permanece **inactiva y oculta** hasta que se configure el ID de seguimiento.

## Cómo Activar Google Ads

No es necesario tocar el código. Solo necesitas añadir una variable de entorno.

### En Producción (Vercel, Netlify, etc.)

1.  Ve al panel de control de tu proyecto en Vercel (Settings > Environment Variables).
2.  Añade una nueva variable:
    *   **Key**: `PUBLIC_GOOGLE_ADS_ID`
    *   **Value**: Tu ID de Google Ads (ej. `AW-123456789` o `G-XXXXXXXXXX`).
3.  Redespliega el proyecto (Redeploy) para que los cambios surtan efecto.

### En Desarrollo (Local)

1.  Abre el archivo `.env` en la raíz del proyecto.
2.  Añade o descomenta la línea:
    ```dotenv
    PUBLIC_GOOGLE_ADS_ID=AW-TU-ID-AQUI
    ```
3.  Reinicia el servidor (`pnpm dev`).

## Características

*   **Optimizado**: Usa **Partytown** para cargar los scripts en un hilo secundario, sin afectar la velocidad de la web.
*   **Cumplimiento GDPR**: No carga ningún script ni cookie de Google hasta que el usuario hace clic en "Aceptar" en el banner de cookies.
*   **Seguro**: Si no hay ID configurado, el código de Google Ads no se ejecuta ni muestra errores.

## ¿Por qué usamos Partytown?

### Sin Partytown (Método Tradicional)
Normalmente, los scripts de terceros como Google Ads o Analytics se ejecutan en el **hilo principal** (Main Thread) del navegador.
*   **Problema**: Compiten con tu código JavaScript (interactividad, animaciones, hidratación de Astro).
*   **Consecuencia**: La página se congela momentáneamente mientras carga estos scripts pesados. Esto afecta negativamente a las métricas Web Vitals (especialmente TBT e INP) y la experiencia de usuario.

### Con Partytown (Nuestra Implementación)
Partytown mueve estos scripts a un **Web Worker** (un hilo en segundo plano).
*   **Beneficio**: El hilo principal queda libre para tu aplicación.
*   **Resultado**:
    *   La página es interactiva mucho más rápido.
    *   Las animaciones no dan tirones al cargar los anuncios.
    *   Mejor puntuación en Google PageSpeed Insights / Lighthouse.
    *   El usuario no nota retrasos al hacer clic o navegar.
