# 🏗️ Barreto Construcciones

Web corporativa moderna y profesional para **Barreto Construcciones**, una empresa líder en el sector de la construcción, rehabilitación y obra civil. Este proyecto ha sido desarrollado con las últimas tecnologías web para garantizar un rendimiento excepcional, una experiencia de usuario fluida y un diseño atractivo.

![Barreto Construcciones Preview](public/files/preview.png) <!-- Asegúrate de añadir una imagen de preview si es posible -->

## 🚀 Tecnologías Utilizadas

Este proyecto está construido sobre un stack tecnológico moderno y eficiente:

- **[Astro 5](https://astro.build/):** Framework web para contenido centrado en el rendimiento.
- **[Tailwind CSS 4](https://tailwindcss.com/):** Framework de utilidad para estilos rápidos y responsivos.
- **[TypeScript](https://www.typescriptlang.org/):** Superset de JavaScript para un código más robusto y seguro.
- **[GSAP](https://greensock.com/gsap/):** Librería líder para animaciones web de alto rendimiento.
- **[Resend](https://resend.com/):** API para el envío de correos electrónicos (Formulario de contacto).
- **[Vercel](https://vercel.com/):** Plataforma de despliegue y hosting (SSR Adapter).

## ✨ Características Principales

- **⚡ Rendimiento Óptimo:** Carga rápida y optimizada gracias a la arquitectura de islas de Astro.
- **📱 Diseño Responsivo:** Adaptado perfectamente a dispositivos móviles, tablets y escritorio.
- **🎨 Animaciones Suaves:** Transiciones y efectos visuales elegantes con GSAP y Tailwind Animations.
- **🔍 SEO Friendly:** Estructura semántica, metaetiquetas, sitemap y robots.txt configurados.
- **📧 Formulario de Contacto:** Integración funcional para recepción de consultas vía email.
- **🖼️ Optimización de Imágenes:** Uso de formatos modernos y carga diferida.
- **📂 Gestión de Contenido:** Estructura organizada para proyectos, servicios y FAQs.

## 🛠️ Instalación y Uso

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [pnpm](https://pnpm.io/) (Recomendado)

### Pasos

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/whoskelos/barreto-construcciones.git
    cd barreto-construcciones
    ```

2.  **Instalar dependencias:**

    ```bash
    pnpm install
    ```

3.  **Configurar variables de entorno:**

    Crea un archivo `.env` en la raíz del proyecto y añade las claves necesarias (por ejemplo, para Resend):

    ```env
    RESEND_API_KEY=tu_api_key_aqui
    ```

4.  **Iniciar el servidor de desarrollo:**

    ```bash
    pnpm dev
    ```

    El sitio estará disponible en `http://localhost:4321`.

## 📂 Estructura del Proyecto

```text
/
├── public/             # Archivos estáticos (imágenes, fuentes, robots.txt)
├── src/
│   ├── assets/         # Recursos procesados (imágenes, svgs)
│   ├── components/     # Componentes reutilizables (UI, Secciones, Common)
│   ├── content/        # Colecciones de contenido (Proyectos, FAQs, Legal)
│   ├── data/           # Datos estáticos (Menú, Info de contacto)
│   ├── layouts/        # Plantillas de página
│   ├── pages/          # Rutas y páginas del sitio
│   ├── styles/         # Estilos globales
│   └── middleware.ts   # Middleware de Astro
├── astro.config.mjs    # Configuración de Astro
├── tailwind.config.mjs # Configuración de Tailwind (si aplica)
└── package.json        # Dependencias y scripts
```

## 🚀 Despliegue

El proyecto está configurado para desplegarse fácilmente en **Vercel**.

1.  Instala la CLI de Vercel o conecta tu repositorio de GitHub a Vercel.
2.  El adaptador `@astrojs/vercel` ya está configurado en `astro.config.mjs`.
3.  Asegúrate de configurar las variables de entorno en el panel de Vercel.

Comando de construcción para producción:

```bash
pnpm build
```

## 📄 Licencia

Este proyecto es propiedad de **Barreto Construcciones**. Todos los derechos reservados.

---

Desarrollado con ❤️ por [Kelvin Guerrero](https://github.com/whoskelos) y [Michael Retamozo](https://github.com/Snakeblack)
