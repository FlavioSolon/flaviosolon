import type { APIRoute } from 'astro';
import { getProfile, getArticles, getProjects } from '@/lib/db';

export const GET: APIRoute = async () => {
  const profile = getProfile();
  const siteUrl = profile.site.replace(/\/$/, '');
  const articles = getArticles();
  const projects = getProjects();

  const routes = [
    { url: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly', lastmod: new Date().toISOString().split('T')[0] },
    { url: `${siteUrl}/blog/`, priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    ...articles.map((a) => ({
      url: `${siteUrl}/blog/${a.slug}/`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: a.date,
    })),
    ...projects.map((p) => ({
      url: `${siteUrl}/#case-${p.id}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: new Date().toISOString().split('T')[0],
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${routes
  .map(
    (r) => `  <url>
    <loc>${r.url}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
