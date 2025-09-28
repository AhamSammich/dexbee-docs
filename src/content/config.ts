import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['getting-started', 'api', 'guides', 'examples', 'migration']),
    order: z.number().default(0),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    lastUpdated: z.date().optional(),
  }),
});

export const collections = {
  docs,
};