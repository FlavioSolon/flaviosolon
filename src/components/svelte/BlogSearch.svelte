<script lang="ts">
  import type { Article } from '../../lib/db';

  interface Props {
    articles: Article[];
  }

  let { articles = [] }: Props = $props();

  let query = $state('');

  let filtered = $derived(
    articles.filter((a) =>
      `${a.title} ${a.description} ${a.category} ${(a.tags || []).join(' ')}`
        .toLocaleLowerCase('pt-BR')
        .includes(query.toLocaleLowerCase('pt-BR'))
    )
  );

  function formatDate(value: string) {
    try {
      return new Date(`${value}T12:00:00Z`).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return value;
    }
  }
</script>

<div class="journal-toolbar">
  <span class="mono">
    {articles.length} ARTIGOS · POR FLÁVIO SÓLON
  </span>
  <label class="article-search">
    <span>Buscar artigos</span>
    <input
      type="search"
      bind:value={query}
      placeholder="Tema, tecnologia ou palavra…"
    />
  </label>
</div>

<section class="article-list" aria-label="Artigos publicados" aria-live="polite">
  {#each filtered as a, i (a.slug)}
    <article class="journal-card">
      <div class="article-mark" aria-hidden="true">
        <span>0{i + 1}</span>
        <span>
          {i === 0 ? "RESILIÊNCIA /" : "ARQUITETURA /"}<br />
          ENGENHARIA<br />
          COM INTENÇÃO.
        </span>
        <span>FS ↗</span>
      </div>
      <div class="journal-card-body">
        <div class="eyebrow">{a.category}</div>
        <h2>
          <a href={`/blog/${a.slug}/`}>{a.title}</a>
        </h2>
        <p>{a.description}</p>
        <div class="article-meta">
          <time datetime={a.date}>{formatDate(a.date)}</time>
          <span>{a.readingTime} de leitura</span>
        </div>
        <a class="article-read" href={`/blog/${a.slug}/`}>
          Ler artigo <span>↗</span>
        </a>
      </div>
    </article>
  {/each}

  {#if filtered.length === 0}
    <p class="empty-search">
      Nenhum artigo encontrado para "{query}". Tente outro termo de busca.
    </p>
  {/if}
</section>
