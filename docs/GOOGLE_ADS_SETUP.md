# Configuración de Google Ads (Optimizado con Partytown)

Este proyecto está preparado para Google Ads, pero la integración permanece **inactiva y oculta** hasta que se configure el ID de seguimiento.

## Cómo Activar Google Ads

No es necesario tocar el código. Solo necesitas añadir variables de entorno.

### En Producción (Vercel, Netlify, etc.)

1.  Ve al panel de control de tu proyecto en Vercel (Settings > Environment Variables).
2.  Añade las siguientes variables:
    *   **`PUBLIC_GOOGLE_ADS_ID`**: Tu ID de Google Ads (ej. `AW-123456789`).
    *   **`PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`**: (Opcional) La etiqueta de conversión para el formulario de contacto (ej. `AbCdEfGhIjK`).
    *   **`PUBLIC_GOOGLE_ADS_TRACK_FORM_START`**: (Opcional) `true` para activar el rastreo de inicio de formulario, `false` para desactivarlo.
3.  Redespliega el proyecto (Redeploy) para que los cambios surtan efecto.

### En Desarrollo (Local)

1.  Abre el archivo `.env` en la raíz del proyecto.
2.  Añade o descomenta las líneas:
    ```dotenv
    PUBLIC_GOOGLE_ADS_ID=AW-TU-ID-AQUI
    PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=TU-ETIQUETA-AQUI
    PUBLIC_GOOGLE_ADS_TRACK_FORM_START=true
    ```
3.  Reinicia el servidor (`pnpm dev`).

## Configuración de Funcionalidades (Feature Flags)

Para facilitar el mantenimiento y permitir cambios rápidos sin tocar el código, hemos implementado "Feature Flags" mediante variables de entorno.

### `PUBLIC_GOOGLE_ADS_TRACK_FORM_START`
Controla si se debe rastrear cuando un usuario empieza a escribir en el formulario de contacto.
*   **`true`** (Recomendado): Activa el evento `form_start`. Útil para estrategias de Remarketing (usuarios que empiezan pero no terminan).
*   **`false`**: Desactiva completamente este rastreo. El código JavaScript asociado no se ejecutará.

## Seguimiento de Conversiones y Remarketing

El proyecto incluye un sistema avanzado para registrar tanto las conversiones finales como la intención del usuario.

### 1. Conversión Final (Envío Exitoso)
Se dispara cuando el usuario envía el formulario de contacto correctamente.
*   **Evento**: `conversion`
*   **Uso**: Medir el éxito de las campañas (CPA, ROAS).
*   **Configuración**: Requiere `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`.

### 2. Intención de Compra (Inicio de Formulario)
Se dispara cuando el usuario **empieza a escribir** en cualquier campo del formulario.
*   **Evento**: `form_start`
*   **Etiqueta**: `contact_page_form_interaction`
*   **Lógica**: Detecta el evento `input` y verifica que haya contenido real (no solo espacios). Solo se envía una vez por sesión.
*   **Uso**: Crear audiencias de **Remarketing**.
    *   *Estrategia*: Puedes crear una audiencia en Google Ads de "Usuarios que iniciaron el formulario pero NO convirtieron" para mostrarles anuncios de recordatorio.

### ¿Cómo obtener la Etiqueta de Conversión?
1.  En tu cuenta de Google Ads, ve a **Objetivos > Conversiones > Resumen**.
2.  Crea una nueva acción de conversión (Sitio web).
3.  Selecciona la categoría "Contacto" o "Envío de formulario para clientes potenciales".
4.  Al finalizar, Google te dará un fragmento de código. Busca algo parecido a:
    `gtag('event', 'conversion', {'send_to': 'AW-123456789/AbCdEfGhIjK'});`
5.  La parte después de la barra (`/`) es tu **Conversion Label** (ej. `AbCdEfGhIjK`).
6.  Añade ese valor a la variable `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`.

## Estructura del Código (SOLID)

La implementación se ha separado en dos componentes para mejorar la mantenibilidad:

1.  **`src/components/common/CookieConsent.astro`**:
    *   Gestiona exclusivamente la interfaz y lógica del consentimiento de cookies.
    *   No contiene código de Google Ads.
    *   Cuando el usuario acepta, emite un evento global `cookie-consent:accepted`.

2.  **`src/components/common/GoogleAds.astro`**:
    *   Contiene la lógica de carga de los scripts de Google.
    *   Escucha el evento `cookie-consent:accepted` para inyectar los scripts.
    *   Usa **Partytown** para la ejecución en segundo plano.

## Sobre AMP (Accelerated Mobile Pages)

Es posible que veas instrucciones de Google Ads sobre "Páginas AMP".

*   **¿Qué es?**: Una tecnología antigua de Google para versiones móviles rápidas.
*   **¿Me afecta?**: **NO**. Este proyecto usa **Astro**, una tecnología moderna que ya ofrece un rendimiento superior sin las restricciones de AMP.
*   **Acción requerida**: Puedes ignorar completamente las instrucciones de Google sobre AMP.

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
