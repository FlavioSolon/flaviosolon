# flaviosolon.com — Astro + Svelte 5

Projeto pessoal de engenharia de software de Flávio Sólon, construído com **Astro 7.3.5** e **Svelte 5 (5.57.2)**, Tailwind CSS v4, arquitetura 100% estática ultrarrápida (Home + Blog) otimizada para SEO, AEO, GEO e CRO.

## Development & Production Server

O servidor Astro roda na porta configurada em `$PORT` (padrão 8443).

- `pnpm run dev` — Servidor de desenvolvimento com hot reload imediato
- `pnpm run build` — Compilação estática (`dist/`)
- `pnpm run preview` — Pré-visualização do build local

## Estrutura do Projeto

- `src/layouts/Layout.astro` — Layout base com gerador de metadados SEO, AEO (JSON-LD `@graph`) e GEO
- `src/pages/index.astro` — Página inicial do portfólio (Hero com micro-prova, casos com CTAs, interlinking do blog)
- `src/pages/blog/index.astro` — Listagem de artigos
- `src/pages/blog/[slug].astro` — Página de leitura de artigo com bloco AEO e tabela de conteúdos
- `src/components/svelte/` — Ilhas reativas Svelte 5 com Runes (`$state`, `$derived`)
  - `ProjectFilter.svelte` — Filtro interativo de projetos com renderização integral no SSR
  - `PillarTabs.svelte` — Pilares filosóficos e técnicos
  - `BlogSearch.svelte` — Busca reativa em tempo real no blog
- `src/data/` — Banco de dados em arquivos JSON com gravação atômica (`articles.json`, `projects.json`, `media.json`, `profile.json`, `faqs.json`)
- `src/lib/`
  - `db.ts` — Camada de acesso a dados
  - `seo.ts` — Gerador especialista de SEO, AEO e GEO

## Dependências Principais

- Astro: `7.3.5`
- Svelte: `5.57.2`
- SvelteKit: `3.0.1`
- @astrojs/svelte: `9.0.1`
- @astrojs/node: `11.1.7`
- sharp: `0.35.5`
- Tailwind CSS v4 com `@tailwindcss/vite`
