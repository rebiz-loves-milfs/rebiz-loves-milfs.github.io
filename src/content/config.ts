import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string().min(1).max(200),
    titleTinted: z.string().optional(),
    published: z.date(),
    updated: z.date().optional(),
    draft: z.boolean().optional().default(false),
    description: z.string().max(500).optional().default(""),
    tags: z.array(z.string().max(50)).optional().default([]),
    category: z.string().optional().nullable().default(""),
    readTime: z.string().max(20).optional().default(""),
    image: z.string().optional().default(""),
    gradient: z.string().optional().default(""),
    glyph: z.string().optional().default(""),
    series: z.string().max(100).optional().default(""),
    seriesOrder: z.number().optional().default(0),
    encrypted: z.boolean().optional().default(false),
    password: z.string().optional().default(""),
    passwordHint: z.string().optional().default(""),
    atmosphere: z
      .enum(["rain", "cafe", "forest", "shrine", "synthwave", "silence"])
      .optional(),
    unlockAt: z.date().optional(),
  }),
});

export const collections = { posts };

export type PostEntry = import("astro:content").CollectionEntry<"posts">;
