<script lang="ts">
  import type { Project } from '../../lib/db';

  interface Props {
    projects: Project[];
    email: string;
  }

  let { projects = [], email = 'contato@flaviosolon.com' }: Props = $props();

  let filter = $state('Tudo');
  let openDetails = $state<Record<string, boolean>>({});

  const filterOptions = ['Tudo', 'Rust', 'Laravel', 'Svelte 5', 'Vue.js', 'Angular', 'Astro'];

  let filteredProjects = $derived(
    projects.filter((p) => filter === 'Tudo' || p.filters.includes(filter))
  );

  let visibleProjects = $derived(filteredProjects);

  function setFilter(f: string) {
    if (filter === f) return;
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.startViewTransition(() => {
        filter = f;
      });
    } else {
      filter = f;
    }
  }

  function toggleDetail(id: string) {
    openDetails[id] = !openDetails[id];
  }
</script>

<div class="filter-row">
  <div class="filters" role="group" aria-label="Filtrar projetos por tecnologia">
    {#each filterOptions as f}
      <button
        type="button"
        aria-pressed={filter === f}
        class={filter === f ? 'active' : ''}
        onclick={() => setFilter(f)}
      >
        {#if f === 'Tudo'}<span>✳ </span>{/if}
        {f}
      </button>
    {/each}
  </div>
  <span class="mono project-count">
    {String(visibleProjects.length).padStart(2, '0')} PROJETOS EM PRODUÇÃO
  </span>
</div>

<div class="project-grid">
  {#each visibleProjects as p (p.id)}
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
              <b><span class="tiny-square"></span> cotinha</b>
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
        {:else if p.visual === 'casadosfilhos'}
          <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #1b2620, #0f1713); padding: 20px; text-align: center;">
            <span style="font-family: var(--mono); font-size: 10px; color: var(--copper); letter-spacing: 1.5px; margin-bottom: 8px;">CASADOSFILHOS.COM</span>
            <strong style="font-family: var(--display); font-size: 20px; color: #f4f4f0; letter-spacing: -0.5px; line-height: 1.2;">Acolhimento & Impacto</strong>
            <div style="display: flex; gap: 8px; margin-top: 14px;">
              <span style="font-family: var(--mono); font-size: 9px; background: #26362d; color: #9bbda5; padding: 3px 8px; border-radius: 2px;">ASTRO</span>
              <span style="font-family: var(--mono); font-size: 9px; background: #26362d; color: #9bbda5; padding: 3px 8px; border-radius: 2px;">SVELTE 5</span>
              <span style="font-family: var(--mono); font-size: 9px; background: #26362d; color: var(--copper); padding: 3px 8px; border-radius: 2px;">PERF 100</span>
            </div>
          </div>
        {:else if p.visual === 'theocidade'}
          <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #171d24, #0d1217); padding: 20px; text-align: center;">
            <span style="font-family: var(--mono); font-size: 10px; color: var(--copper); letter-spacing: 1.5px; margin-bottom: 8px;">INSTITUTOTHEOCIDADE.COM</span>
            <strong style="font-family: var(--display); font-size: 20px; color: #f4f4f0; letter-spacing: -0.5px; line-height: 1.2;">Plataforma EAD & LMS</strong>
            <div style="display: flex; gap: 8px; margin-top: 14px;">
              <span style="font-family: var(--mono); font-size: 9px; background: #1c2b36; color: #9bc2e0; padding: 3px 8px; border-radius: 2px;">LARAVEL</span>
              <span style="font-family: var(--mono); font-size: 9px; background: #1c2b36; color: #9bc2e0; padding: 3px 8px; border-radius: 2px;">VUE.JS</span>
              <span style="font-family: var(--mono); font-size: 9px; background: #1c2b36; color: var(--copper); padding: 3px 8px; border-radius: 2px;">EDUCAÇÃO</span>
            </div>
          </div>
        {:else if p.visual === 'kblanguage'}
          <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #241c22, #140f13); padding: 20px; text-align: center;">
            <span style="font-family: var(--mono); font-size: 10px; color: var(--copper); letter-spacing: 1.5px; margin-bottom: 8px;">KBLANGUAGESCHOOL.VERCEL.APP</span>
            <strong style="font-family: var(--display); font-size: 20px; color: #f4f4f0; letter-spacing: -0.5px; line-height: 1.2;">Imersão em Idiomas</strong>
            <div style="display: flex; gap: 8px; margin-top: 14px;">
              <span style="font-family: var(--mono); font-size: 9px; background: #382433; color: #e09bc5; padding: 3px 8px; border-radius: 2px;">SVELTE 5</span>
              <span style="font-family: var(--mono); font-size: 9px; background: #382433; color: #e09bc5; padding: 3px 8px; border-radius: 2px;">RESPONSIVO</span>
            </div>
          </div>
        {:else if p.visual === 'nutricandies'}
          <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #262118, #17130c); padding: 20px; text-align: center;">
            <span style="font-family: var(--mono); font-size: 10px; color: var(--copper); letter-spacing: 1.5px; margin-bottom: 8px;">NUTRICANDIES.COM</span>
            <strong style="font-family: var(--display); font-size: 20px; color: #f4f4f0; letter-spacing: -0.5px; line-height: 1.2;">CMS & Catálogo Comercial</strong>
            <div style="display: flex; gap: 8px; margin-top: 14px;">
              <span style="font-family: var(--mono); font-size: 9px; background: #362c1c; color: #dfbe8f; padding: 3px 8px; border-radius: 2px;">NUXT 3</span>
              <span style="font-family: var(--mono); font-size: 9px; background: #362c1c; color: #dfbe8f; padding: 3px 8px; border-radius: 2px;">LARAVEL</span>
              <span style="font-family: var(--mono); font-size: 9px; background: #362c1c; color: var(--copper); padding: 3px 8px; border-radius: 2px;">FILAMENT</span>
            </div>
          </div>
        {:else}
          <div class="extra-preview">
            <span>{p.visual === 'editorial' ? 'academiatech.online' : 'CORE / ENGINE'}</span>
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
          {#if p.url && !p.isPrivate}
            <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Acessar ${p.title}`}>
              <span aria-hidden="true">↗</span>
            </a>
          {:else}
            <span class="private-badge">Sistema Corporativo</span>
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
              <div class="mono" style="font-size: 12px; color: var(--copper); margin-bottom: 12px;">
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
