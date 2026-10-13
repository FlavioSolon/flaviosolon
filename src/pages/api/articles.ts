import type { APIRoute } from 'astro';
import { getArticles, getArticleBySlug, saveArticle, deleteArticle } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

function requireAuth(cookies: any): boolean {
  const token = cookies.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export const GET: APIRoute = async ({ url, cookies }) => {
  const isAuth = requireAuth(cookies);
  const slug = url.searchParams.get('slug');

  if (slug) {
    const article = getArticleBySlug(slug);
    if (!article) {
      return new Response(JSON.stringify({ error: 'Artigo não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(article), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const articles = getArticles(isAuth);
  return new Response(JSON.stringify(articles), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.slug) {
      return new Response(JSON.stringify({ error: 'Título e slug são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const saved = saveArticle(body);
    return new Response(JSON.stringify(saved), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    if (!body.slug) {
      return new Response(JSON.stringify({ error: 'Slug é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const saved = saveArticle(body);
    return new Response(JSON.stringify(saved), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ url, cookies }) => {
  if (!requireAuth(cookies)) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug não fornecido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = deleteArticle(slug);
  if (!success) {
    return new Response(JSON.stringify({ error: 'Artigo não encontrado para remoção.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
