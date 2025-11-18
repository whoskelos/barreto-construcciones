import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
    const siteUrl = site?.toString() || 'https://barretoconstrucciones.es';
    
    // Define todas las URLs estáticas de la web
    const staticPages = [
        '',
        'proyectos',
        'contacto',
        'preguntas-frecuentes',
        'areas-de-negocio',
        'areas-de-negocio/industrial',
        'areas-de-negocio/rehabilitacion',
        'areas-de-negocio/residencial',
        'areas-de-negocio/obra-civil',
        'areas-de-negocio/mantenimiento',
        'legal/aviso-legal',
        'legal/politica-de-cookies',
        'legal/politica-de-privacidad',
    ];

    // Prioridades y frecuencias de actualización
    const urlConfig: Record<string, { priority: number; changefreq: string }> = {
        '': { priority: 1.0, changefreq: 'weekly' },
        'proyectos': { priority: 0.9, changefreq: 'weekly' },
        'contacto': { priority: 0.9, changefreq: 'monthly' },
        'preguntas-frecuentes': { priority: 0.7, changefreq: 'monthly' },
        'areas-de-negocio': { priority: 0.8, changefreq: 'monthly' },
        'areas-de-negocio/industrial': { priority: 0.8, changefreq: 'monthly' },
        'areas-de-negocio/rehabilitacion': { priority: 0.8, changefreq: 'monthly' },
        'areas-de-negocio/residencial': { priority: 0.8, changefreq: 'monthly' },
        'areas-de-negocio/obra-civil': { priority: 0.8, changefreq: 'monthly' },
        'areas-de-negocio/mantenimiento': { priority: 0.8, changefreq: 'monthly' },
        'legal/aviso-legal': { priority: 0.3, changefreq: 'yearly' },
        'legal/politica-de-cookies': { priority: 0.3, changefreq: 'yearly' },
        'legal/politica-de-privacidad': { priority: 0.3, changefreq: 'yearly' },
    };

    const currentDate = new Date().toISOString();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticPages.map((page) => {
    const config = urlConfig[page] || { priority: 0.5, changefreq: 'monthly' };
    const url = `${siteUrl}${page}`;
    
    return `    <url>
        <loc>${url}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${config.changefreq}</changefreq>
        <priority>${config.priority}</priority>
    </url>`;
}).join('\n')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        },
    });
};
