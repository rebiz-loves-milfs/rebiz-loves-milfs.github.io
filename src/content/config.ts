import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    titleTinted: z.string().optional(),
    published: z.date(),
    updated: z.date().optional(),
    draft: z.boolean().optional().default(false),
    description: z.string().optional().default(''),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional().nullable().default(''),
    readTime: z.string().optional().default(''),
    image: z.string().optional().default(''),
    gradient: z.string().optional().default(''),
    glyph: z.string().optional().default(''),
    series: z.string().optional().default(''),
    seriesOrder: z.number().optional().default(0),
    encrypted: z.boolean().optional().default(false),
    password: z.string().optional().default(''),
    passwordHint: z.string().optional().default(''),
    atmosphere: z.enum(['rain', 'cafe', 'forest', 'shrine', 'synthwave', 'silence']).optional(),
  }),
});

export const collections = { posts };
