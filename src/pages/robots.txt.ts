import type { APIRoute } from 'astro';
import { getProfile } from '@/lib/db';

export const GET: APIRoute = async () => {
  const profile = getProfile();
  const siteUrl = profile.site.replace(/\/$/, '');

  const robots = `# Robots.txt otimizado para SEO, AEO e motores de busca generativos
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Permissão explícita para Crawlers de Inteligência Artificial e Modelos de Linguagem (AEO)
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Google-Extended
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Applebot-Extended
Allow: /
Disallow: /admin/
Disallow: /api/

# Sitemap Canônico
Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
