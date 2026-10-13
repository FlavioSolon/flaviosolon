<script lang="ts">
  import type { Project } from '../../lib/db';

  interface Props {
    projects: Project[];
    email: string;
  }

  let { projects = [], email = 'solondutra73@gmail.com' }: Props = $props();

  let filter = $state('Tudo');
  let showAll = $state(false);
  let openDetails = $state<Record<string, boolean>>({});

  const filterOptions = ['Tudo', 'Rust', 'Laravel', 'Svelte 5', 'Angular', 'Astro'];

  let filteredProjects = $derived(
    projects.filter((p) => filter === 'Tudo' || p.filters.includes(filter))
  );

  let visibleProjects = $derived(
    filter === 'Tudo' && !showAll ? filteredProjects.slice(0, 3) : filteredProjects
  );

  function toggleDetail(id: string) {
    openDetails[id] = !openDetails[id];
  }
</script>

<div class="filter-row">
  <div class="filters" role="group" aria-label="Filtrar projetos por tecnologia">
    {#each filterOptions as f}
      <button
        aria-pressed={filter === f}
        class={filter === f ? 'active' : ''}
        onclick={() => (filter = f)}
      >
        {#if f === 'Tudo'}<span>✳ </span>{/if}
        {f}
      </button>
    {/each}
  </div>
  <span class="mono project-count">
    {String(visibleProjects.length).padStart(2, '0')} PROJETOS SELECIONADOS
  </span>
</div>

<div class="project-grid">
  {#each visibleProjects as p, index (p.id)}
    <article class="project-card">
      <div class={`project-visual ${p.visual}`} aria-hidden="true">
        {#if p.coverImage}
          <picture class="project-cover-picture">
            {#if p.coverImageAvif}<source srcset={p.coverImageAvif} type="image/avif" />{/if}
            {#if p.coverImageWebp}<source srcset={p.coverImageWebp} type="image/webp" />{/if}
            <img src={p.coverImage} alt={p.title} loading="lazy" decoding="async" class="project-cover-img" />
          </picture>
        {:else if p.visual === 'finance'}
          <div class="mini-app">
            <div class="mini-top">
              <b><span class="tiny-square"></span> cotinhas</b>
              <span>Visão geral ···</span>
            </div>
            <div class="mini-greeting">Pequenos passos. Grandes conquistas.</div>
            <div class="balance">
              <small>Total arrecadado</small>
              <strong>R$ 12.450<span>,00</span></strong>
              <i>↗ Tudo começa com uma cotinha.</i>
            </div>
            <div class="mini-bottom">
              <span>Viagem em família <b>78%</b><em></em></span>
              <span>Nosso próximo capítulo <b>42%</b><em></em></span>
            </div>
          </div>
        {:else if p.visual === 'receipt'}
          <div class="receipt-composition">
            <div class="receipt-brand">
              no<span>capricho</span>
              <small>Simples. Rápido. Bem-feito.</small>
            </div>
            <div class="receipt-paper">
              <div>RECIBO <b>Nº 00128</b></div>
              <strong>R$ 1.500,00</strong>
              <p>Recebemos de João Silva<br />a importância acima referente aos<br />serviços prestados.</p>
              <div class="receipt-sign">Flávio Sólon</div>
              <small>Assinatura do responsável</small>
            </div>
            <div class="pdf-badge">↙ PDF pronto. Sem complicação.</div>
          </div>
        {:else if p.visual === 'map'}
          <div class="map-app">
            <div class="map-sidebar">
              <b>cec<span>rastreamento</span></b>
              <small>VISÃO GERAL</small>
              <p>◈ Dashboard</p>
              <p class="chosen">◎ Rastreamento</p>
              <p>▤ Veículos</p>
              <p>◷ Histórico</p>
              <div><i></i> 24 veículos online</div>
            </div>
            <div class="map-grid">
              <svg viewBox="0 0 300 180">
                <path d="M-20 130 L50 105 L80 140 L125 95 L165 110 L220 35 L310 50"></path>
                <circle cx="125" cy="95" r="6"></circle>
                <circle cx="220" cy="35" r="6"></circle>
              </svg>
              <span class="map-pin">◎</span>
              <div class="map-status">
                <i></i> Frota conectada <b>24/24</b>
              </div>
            </div>
          </div>
        {:else}
          <div class="extra-preview">
            <span>{p.visual === 'editorial' ? 'academia.tech' : 'CORE / ENGINE'}</span>
            <strong>{p.visual === 'editorial' ? 'Conhecimento que vai além.' : 'Complexidade sob controle.'}</strong>
            <div class="preview-bars"><i></i><i></i><i></i><i></i></div>
          </div>
        {/if}
      </div>

      <div class="project-info">
        <div class="project-type">
          {p.type}
          <span>0{projects.indexOf(p) + 1}</span>
        </div>
        <div class="project-title">
          <h3>{p.title}</h3>
          {#if p.url}
            <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Acessar ${p.title}`}>
              <span aria-hidden="true">↗</span>
            </a>
          {/if}
        </div>
        <p>{p.description}</p>
        <div class="tags">
          {#each p.stack as s}
            <span>{s}</span>
          {/each}
        </div>

        <details class="project-details" open={openDetails[p.id]}>
          <summary onclick={(e) => { e.preventDefault(); toggleDetail(p.id); }}>
            {p.label}
            <span>{openDetails[p.id] ? '−' : '+'}</span>
          </summary>
          <div class="project-expanded-content">
            <p>
              {p.longDescription || p.description} Stack principal: {p.stack.join(', ')}.
            </p>
            {#if p.metrics}
              <div class="mono" style="font-size: 11px; color: var(--copper); margin-bottom: 12px;">
                ↳ Impacto: {p.metrics}
              </div>
            {/if}
            <a href={`mailto:${email}?subject=Projeto ${p.title}`} style="display: block; color: var(--copper); margin-bottom: 15px; font-size: 13px;">
              Vamos conversar sobre esta solução ↗
            </a>
          </div>
        </details>
      </div>
    </article>
  {/each}
</div>

{#if filter === 'Tudo'}
  <button class="view-all" onclick={() => (showAll = !showAll)}>
    {showAll ? 'Mostrar seleção' : 'Explorar todos os projetos'}
    <span>{showAll ? '−' : '+'}</span>
  </button>
{/if}
