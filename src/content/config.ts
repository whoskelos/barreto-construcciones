import { defineCollection, z } from "astro:content";

const legalCollection = defineCollection({
    schema: z.object({
        title: z.string(),
    }),
});

const projectsCollection = defineCollection({
    type: 'data',
    schema: ({ image }) => z.object({
        id: z.number(),
        obra: z.string(),
        lugar: z.string(),
        año: z.string(),
        cliente: z.string(),
        image: image(),
    }),
});

const servicesCollection = defineCollection({
    type: 'data',
    schema: ({ image }) => z.object({
        title: z.string(),
        icon: z.string(),
        menuDescription: z.string().optional(),
        seo: z.object({
            title: z.string(),
            description: z.string(),
            keywords: z.string(),
        }),
        heroImage: image(),
        corporativoImage: image(),
        nameTransition: z.string(),
        introTitle: z.string(),
        introDescription: z.string(),
        features: z.array(z.object({
            icon: z.string(),
            title: z.string(),
            description: z.string(),
        })),
        asteriskNote: z.string().optional(),
    }),
});

const faqsCollection = defineCollection({
    type: 'data',
    schema: z.object({
        question: z.string(),
        answer: z.string(),
    }),
});

export const collections = {
    legal: legalCollection,
    projects: projectsCollection,
    services: servicesCollection,
    faqs: faqsCollection,
};