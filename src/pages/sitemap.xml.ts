import type { APIRoute } from 'astro';
import { getSortedPosts, getCategoryList, getTagList, slugify } from '../utils/content-utils';
import { SITE } from '../config';

export const GET: APIRoute = async () => {
  const posts = await getSortedPosts();
  const categories = await getCategoryList();
  const tags = await getTagList();
  const base = SITE.url.replace(/\/$/, '');

  const staticRoutes = ['/', '/archive', '/about', '/anime'];

  const urls: string[] = [
    ...staticRoutes.map(r => `${base}${r}`),
    ...posts.map(p => `${base}/posts/${p.id}`),
    ...categories.map(c => `${base}/category/${slugify(c.name)}`),
    ...tags.map(t => `${base}/tag/${t.name}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
