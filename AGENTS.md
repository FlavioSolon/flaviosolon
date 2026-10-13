# flaviosolon.com — Astro + Svelte 5

Projeto pessoal de engenharia de software de Flávio Sólon, construído com **Astro 7.3.5** e **Svelte 5 (5.57.2)**, Tailwind CSS v4, painel administrativo seguro e pipeline de imagens WebP/AVIF via Sharp.

## Development & Production Server

O servidor Astro roda na porta configurada em `$PORT` (padrão 8443).

- `pnpm run dev` — Servidor de desenvolvimento com hot reload imediato
- `pnpm run build` — Compilação com SSR Node adapter
- `pnpm run start` — Executa o servidor compilado (`dist/server/entry.mjs`)

## Estrutura do Projeto

- `src/layouts/Layout.astro` — Layout base com gerador de metadados SEO, AEO (JSON-LD `@graph`) e GEO
- `src/pages/index.astro` — Página inicial do portfólio
- `src/pages/blog/index.astro` — Listagem de artigos
- `src/pages/blog/[slug].astro` — Página de leitura de artigo com bloco AEO e tabela de conteúdos
- `src/pages/admin/index.astro` — Painel administrativo seguro com dashboard reativo
- `src/pages/admin/login.astro` — Tela de login com proteção contra força bruta
- `src/pages/api/` — Endpoints REST protegidos (artigos, projetos, upload de imagens, autenticação)
- `src/components/svelte/` — Ilhas reativas Svelte 5 com Runes (`$state`, `$derived`)
  - `ProjectFilter.svelte` — Filtro interativo de projetos com accordion de detalhes
  - `PillarTabs.svelte` — Pilares filosóficos e técnicos
  - `BlogSearch.svelte` — Busca reativa em tempo real no blog
  - `admin/AdminApp.svelte` — Aplicação SPA administrativa completa
- `src/data/` — Banco de dados em arquivos JSON com gravação atômica (`articles.json`, `projects.json`, `media.json`, `profile.json`, `faqs.json`)
- `src/lib/`
  - `auth.ts` — Autenticação, rate limiting e tokens de sessão HMAC
  - `db.ts` — Camada de acesso a dados
  - `images.ts` — Pipeline Sharp para conversão automática em WebP e AVIF
  - `seo.ts` — Gerador especialista de SEO, AEO e GEO

## Dependências Principais

- Astro: `7.3.5`
- Svelte: `5.57.2`
- SvelteKit: `3.0.1`
- @astrojs/svelte: `9.0.1`
- @astrojs/node: `11.1.7`
- sharp: `0.35.5`
- Tailwind CSS v4 com `@tailwindcss/vite`
