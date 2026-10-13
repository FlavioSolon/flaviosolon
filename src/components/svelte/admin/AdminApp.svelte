<script lang="ts">
  import type { Article, Project, MediaItem, Profile } from '@/lib/db';

  interface Props {
    initialArticles: Article[];
    initialProjects: Project[];
    initialMedia: MediaItem[];
    initialProfile: Profile;
  }

  let { initialArticles = [], initialProjects = [], initialMedia = [], initialProfile }: Props = $props();

  let activeTab = $state<'overview' | 'articles' | 'projects' | 'media' | 'settings'>('overview');
  let notification = $state<{ type: 'success' | 'error'; message: string } | null>(null);

  // Articles state
  let articles = $state<Article[]>([]);
  let editingArticle = $state<Article | null>(null);
  let isNewArticle = $state(false);

  // Projects state
  let projects = $state<Project[]>([]);
  let editingProject = $state<Project | null>(null);
  let isNewProject = $state(false);

  // Media state
  let mediaList = $state<MediaItem[]>([]);
  let isUploading = $state(false);
  let uploadProgress = $state<string>('');
  let isDragOver = $state(false);

  // Profile state
  let profile = $state<Profile>({} as Profile);

  // Initialize state from server props
  $effect(() => {
    articles = [...initialArticles];
    projects = [...initialProjects];
    mediaList = [...initialMedia];
    profile = { ...initialProfile };
  });

  function notify(message: string, type: 'success' | 'error' = 'success') {
    notification = { type, message };
    setTimeout(() => {
      notification = null;
    }, 4000);
  }

  // --- Article functions ---
  function startNewArticle() {
    editingArticle = {
      slug: '',
      title: '',
      description: '',
      category: 'ENGENHARIA & IMPACTO',
      date: new Date().toISOString().split('T')[0],
      readingTime: '3 min',
      status: 'published',
      tags: ['Arquitetura', 'Engenharia'],
      aeoSummary: '',
      geoContext: 'Desenvolvimento e arquitetura a partir de Manaus, AM.',
      coverImage: '',
      coverImageWebp: '',
      coverImageAvif: '',
      sections: [
        {
          title: 'Introdução e Contexto',
          paragraphs: [''],
        },
      ],
    };
    isNewArticle = true;
  }

  function editArticle(article: Article) {
    editingArticle = JSON.parse(JSON.stringify(article));
    isNewArticle = false;
  }

  function addSection() {
    if (!editingArticle) return;
    editingArticle.sections.push({
      title: 'Nova Seção',
      paragraphs: [''],
    });
  }

  function removeSection(index: number) {
    if (!editingArticle) return;
    editingArticle.sections.splice(index, 1);
  }

  function addParagraph(sectionIndex: number) {
    if (!editingArticle) return;
    editingArticle.sections[sectionIndex].paragraphs.push('');
  }

  function removeParagraph(sectionIndex: number, pIndex: number) {
    if (!editingArticle) return;
    editingArticle.sections[sectionIndex].paragraphs.splice(pIndex, 1);
  }

  function generateSlugFromTitle() {
    if (!editingArticle || !editingArticle.title) return;
    editingArticle.slug = editingArticle.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function saveArticle() {
    if (!editingArticle) return;
    if (!editingArticle.title || !editingArticle.slug) {
      notify('Título e slug são obrigatórios.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/articles', {
        method: isNewArticle ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingArticle),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao salvar artigo');
      }

      const saved = await res.json();
      if (isNewArticle) {
        articles = [saved, ...articles];
      } else {
        articles = articles.map((a) => (a.slug === saved.slug ? saved : a));
      }

      notify(`Artigo "${saved.title}" salvo com sucesso!`);
      editingArticle = null;
    } catch (err: any) {
      notify(err.message, 'error');
    }
  }

  async function deleteArticle(slug: string) {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    try {
      const res = await fetch(`/api/articles?slug=${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      articles = articles.filter((a) => a.slug !== slug);
      notify('Artigo removido com sucesso.');
    } catch (err: any) {
      notify(err.message, 'error');
    }
  }

  // --- Project functions ---
  function startNewProject() {
    editingProject = {
      id: '',
      title: '',
      type: 'PRODUTIVIDADE · SAAS',
      category: 'SaaS',
      description: '',
      longDescription: '',
      stack: ['Rust', 'Svelte 5'],
      filters: ['Svelte 5'],
      visual: 'editorial',
      label: 'Engenharia de precisão',
      featured: true,
      metrics: '',
      url: '',
      coverImage: '',
      coverImageWebp: '',
      coverImageAvif: '',
    };
    isNewProject = true;
  }

  function editProject(project: Project) {
    editingProject = JSON.parse(JSON.stringify(project));
    isNewProject = false;
  }

  async function saveProject() {
    if (!editingProject) return;
    if (!editingProject.title || !editingProject.id) {
      notify('Título e ID são obrigatórios.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: isNewProject ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao salvar projeto');
      }

      const saved = await res.json();
      if (isNewProject) {
        projects = [...projects, saved];
      } else {
        projects = projects.map((p) => (p.id === saved.id ? saved : p));
      }

      notify(`Projeto "${saved.title}" salvo com sucesso!`);
      editingProject = null;
    } catch (err: any) {
      notify(err.message, 'error');
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      projects = projects.filter((p) => p.id !== id);
      notify('Projeto removido com sucesso.');
    } catch (err: any) {
      notify(err.message, 'error');
    }
  }

  // --- Image Upload Pipeline ---
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    isUploading = true;
    uploadProgress = `Otimizando e convertendo ${files.length} imagem(ns) para WebP e AVIF com Sharp...`;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('altText', file.name.replace(/\.[^/.]+$/, ''));

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Erro no upload');
        }

        const data = await res.json();
        mediaList = [data.media, ...mediaList];
      }

      notify('Imagens convertidas automaticamente para WebP e AVIF com máxima compressão!');
    } catch (err: any) {
      notify(err.message, 'error');
    } finally {
      isUploading = false;
      uploadProgress = '';
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    notify(`${label} copiado para a área de transferência!`);
  }

  // --- Profile Settings ---
  async function saveProfileSettings() {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Falha ao atualizar perfil');
      notify('Configurações de SEO, GEO e Perfil salvas!');
    } catch (err: any) {
      notify(err.message, 'error');
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }
</script>

<div class="admin-shell">
  <header class="admin-header">
    <div class="admin-brand">
      <a href="/" class="wordmark" style="font-size: 20px; line-height: 1;">
        flávio sól<span class="logo-o">o</span>n<span class="logo-dot">.</span>
      </a>
      <span class="admin-badge">ADMIN SEGURO</span>
      <span class="mono" style="font-size: 9px; color: #829486;">
        ⌖ MANAUS, BRASIL (BR-AM)
      </span>
    </div>

    <nav class="admin-nav">
      <button
        type="button"
        class={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        onclick={() => (activeTab = 'overview')}
      >
        📊 Painel
      </button>
      <button
        type="button"
        class={`admin-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
        onclick={() => (activeTab = 'articles')}
      >
        ✍️ Artigos ({articles.length})
      </button>
      <button
        type="button"
        class={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
        onclick={() => (activeTab = 'projects')}
      >
        💼 Projetos ({projects.length})
      </button>
      <button
        type="button"
        class={`admin-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
        onclick={() => (activeTab = 'media')}
      >
        🖼️ Fotos WebP/AVIF ({mediaList.length})
      </button>
      <button
        type="button"
        class={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onclick={() => (activeTab = 'settings')}
      >
        ⚙️ SEO & GEO
      </button>
    </nav>

    <div style="display: flex; gap: 12px; align-items: center;">
      <a href="/" target="_blank" class="admin-btn admin-btn-secondary" style="font-size: 11px; padding: 8px 14px;">
        Ver Site ↗
      </a>
      <button type="button" class="admin-btn admin-btn-danger" style="font-size: 11px; padding: 8px 14px;" onclick={logout}>
        Sair
      </button>
    </div>
  </header>

  {#if notification}
    <div
      style={`position: fixed; top: 75px; right: 28px; z-index: 100; padding: 14px 22px; border-radius: 3px; font-size: 13px; font-family: var(--mono); ${
        notification.type === 'success'
          ? 'background: #192b1f; color: #bde4c5; border: 1px solid #376442;'
          : 'background: #391c1c; color: #f5b9b9; border: 1px solid #733939;'
      }`}
    >
      {notification.message}
    </div>
  {/if}

  <main class="admin-container">
    <!-- TAB 1: OVERVIEW -->
    {#if activeTab === 'overview'}
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
        <div class="admin-card" style="margin-bottom: 0;">
          <span class="admin-label">ARTIGOS PUBLICADOS</span>
          <div style="font-size: 36px; font-weight: 700; font-family: var(--display); color: var(--copper);">
            {articles.length}
          </div>
          <span class="mono" style="font-size: 10px; color: #7f8a82;">Com schemas BlogPosting</span>
        </div>
        <div class="admin-card" style="margin-bottom: 0;">
          <span class="admin-label">PROJETOS EM DESTAQUE</span>
          <div style="font-size: 36px; font-weight: 700; font-family: var(--display); color: #9bb59f;">
            {projects.length}
          </div>
          <span class="mono" style="font-size: 10px; color: #7f8a82;">Com schemas SoftwareApp</span>
        </div>
        <div class="admin-card" style="margin-bottom: 0;">
          <span class="admin-label">MÍDIAS WEBP + AVIF</span>
          <div style="font-size: 36px; font-weight: 700; font-family: var(--display); color: #d1b790;">
            {mediaList.length}
          </div>
          <span class="mono" style="font-size: 10px; color: #7f8a82;">Otimização Sharp ativa</span>
        </div>
        <div class="admin-card" style="margin-bottom: 0;">
          <span class="admin-label">RELEVÂNCIA REGIONAL GEO</span>
          <div style="font-size: 20px; font-weight: 700; font-family: var(--display); color: #74ba8e; margin-top: 10px;">
            Manaus / BR-AM
          </div>
          <span class="mono" style="font-size: 10px; color: #7f8a82;">Lat -3.1190 / Lon -60.0217</span>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h2 class="admin-card-title">Mecanismos Especialistas Ativos: SEO + AEO + GEO</h2>
          <span class="admin-badge">MAX SCORE 100%</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; font-size: 13px; line-height: 1.7; color: #b2baa8;">
          <div style="background: #151b17; padding: 20px; border: 1px solid #2d3b31;">
            <strong style="color: var(--copper); font-size: 15px; display: block; margin-bottom: 8px;">
              🔍 SEO Especialista
            </strong>
            <p>
              • URLs Canônicas e Sitemap XML dinâmico.<br />
              • OpenGraph e Twitter Cards de alta fidelidade.<br />
              • Core Web Vitals com zero Layout Shift.<br />
              • Imagens em formato AVIF e WebP responsivas.
            </p>
          </div>
          <div style="background: #151b17; padding: 20px; border: 1px solid #2d3b31;">
            <strong style="color: #9cb8a5; font-size: 15px; display: block; margin-bottom: 8px;">
              🤖 AEO (Answer Engines & IAs)
            </strong>
            <p>
              • Schemas JSON-LD em <code>@graph</code> completo.<br />
              • Sínteses executivas prontas para Perplexity e ChatGPT.<br />
              • Tags <code>Speakable</code> para assistentes de voz.<br />
              • Arquivos <code>llms.txt</code> e <code>llms-full.txt</code> integrados.
            </p>
          </div>
          <div style="background: #151b17; padding: 20px; border: 1px solid #2d3b31;">
            <strong style="color: #d1b790; font-size: 15px; display: block; margin-bottom: 8px;">
              🌎 GEO (Geolocalização & Autoridade)
            </strong>
            <p>
              • Coordenadas GPS de Manaus (-3.1190, -60.0217).<br />
              • Meta tags <code>geo.region</code> e <code>ICBM</code>.<br />
              • Entidades conectadas à Amazônia e atuação remota global.<br />
              • Contexto cultural de Shinkyokushin e missões fluviais.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- TAB 2: ARTICLES -->
    {#if activeTab === 'articles'}
      {#if editingArticle}
        <div class="admin-card">
          <div class="admin-card-header">
            <h2 class="admin-card-title">
              {isNewArticle ? 'Criar Novo Artigo' : `Editando: ${editingArticle.title}`}
            </h2>
            <div style="display: flex; gap: 12px;">
              <button type="button" class="admin-btn admin-btn-secondary" onclick={() => (editingArticle = null)}>
                Cancelar
              </button>
              <button type="button" class="admin-btn" onclick={saveArticle}>
                Salvar Artigo
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">
            <!-- Left: Content Form -->
            <div>
              <div style="margin-bottom: 20px;">
                <label class="admin-label" for="article-title">TÍTULO DO ARTIGO (SEO OPTIMIZED)</label>
                <input
                  id="article-title"
                  class="admin-input"
                  bind:value={editingArticle.title}
                  onblur={generateSlugFromTitle}
                  placeholder="Ex: Arquitetura de microsserviços tolerante a falhas"
                />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div>
                  <label class="admin-label" for="article-slug">SLUG (URL CANÔNICA)</label>
                  <input
                    id="article-slug"
                    class="admin-input"
                    bind:value={editingArticle.slug}
                    placeholder="arquitetura-tolerante-a-falhas"
                  />
                </div>
                <div>
                  <label class="admin-label" for="article-category">CATEGORIA</label>
                  <input
                    id="article-category"
                    class="admin-input"
                    bind:value={editingArticle.category}
                    placeholder="ARQUITETURA DE SOFTWARE"
                  />
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <label class="admin-label" for="article-desc">META DESCRIPTION (RESUMO SEO - ATÉ 160 CARACTERES)</label>
                <textarea
                  id="article-desc"
                  class="admin-textarea"
                  style="min-height: 80px;"
                  bind:value={editingArticle.description}
                  placeholder="Resumo atraente e claro para o Google e redes sociais..."
                ></textarea>
                <span class="mono" style="font-size: 10px; color: #879288;">
                  Caracteres: {editingArticle.description.length} / 160
                </span>
              </div>

              <!-- AEO Box Section -->
              <div style="background: #141f18; border: 1px solid #36493c; padding: 20px; margin-bottom: 24px; border-radius: 3px;">
                <label class="admin-label" for="article-aeo" style="color: var(--copper);">
                  💡 SÍNTESE AEO (RESPOSTA DIRETA PARA PERPLEXITY, CHATGPT & LLMs)
                </label>
                <textarea
                  id="article-aeo"
                  class="admin-textarea"
                  style="min-height: 90px; background: #0c1410;"
                  bind:value={editingArticle.aeoSummary}
                  placeholder="Síntese factual e direta em 40-60 palavras contendo a resposta definitiva do artigo para indexadores de IA..."
                ></textarea>
                <span class="mono" style="font-size: 10px; color: #9bbda5;">
                  Modelos de IA usam este bloco para citações e respostas em destaque nos resultados.
                </span>
              </div>

              <!-- Sections Editor -->
              <div style="margin-top: 32px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <h3 style="font: 600 18px var(--display); margin: 0;">Seções do Artigo</h3>
                  <button type="button" class="admin-btn admin-btn-secondary" style="font-size: 11px; padding: 6px 14px;" onclick={addSection}>
                    + Adicionar Seção
                  </button>
                </div>

                {#each editingArticle.sections as section, sIndex}
                  <div style="background: #0f1313; border: 1px solid #232a27; padding: 20px; margin-bottom: 16px; border-radius: 3px;">
                    <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: center;">
                      <input
                        class="admin-input"
                        style="font-weight: 600;"
                        bind:value={section.title}
                        placeholder="Título da Seção (H2)"
                      />
                      {#if editingArticle.sections.length > 1}
                        <button
                          type="button"
                          class="admin-btn admin-btn-danger"
                          style="padding: 8px 12px; font-size: 11px;"
                          onclick={() => removeSection(sIndex)}
                        >
                          ✕
                        </button>
                      {/if}
                    </div>

                    {#each section.paragraphs as p, pIndex}
                      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                        <textarea
                          class="admin-textarea"
                          style="min-height: 70px;"
                          bind:value={section.paragraphs[pIndex]}
                          placeholder={`Parágrafo ${pIndex + 1}...`}
                        ></textarea>
                        {#if section.paragraphs.length > 1}
                          <button
                            type="button"
                            class="admin-btn admin-btn-danger"
                            style="padding: 6px 10px; font-size: 10px; align-self: flex-start;"
                            onclick={() => removeParagraph(sIndex, pIndex)}
                          >
                            ✕
                          </button>
                        {/if}
                      </div>
                    {/each}

                    <button
                      type="button"
                      class="admin-btn admin-btn-secondary"
                      style="font-size: 10px; padding: 5px 12px; margin-top: 6px;"
                      onclick={() => addParagraph(sIndex)}
                    >
                      + Novo Parágrafo
                    </button>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Right: Meta, Cover Image & SEO Checklist -->
            <div>
              <div class="admin-card" style="padding: 20px; margin-bottom: 20px;">
                <h4 style="font: 600 15px var(--display); margin: 0 0 16px;">Configurações & Publicação</h4>

                <div style="margin-bottom: 14px;">
                  <label class="admin-label" for="article-date">DATA DE PUBLICAÇÃO</label>
                  <input id="article-date" type="date" class="admin-input" bind:value={editingArticle.date} />
                </div>

                <div style="margin-bottom: 14px;">
                  <label class="admin-label" for="article-readtime">TEMPO DE LEITURA</label>
                  <input id="article-readtime" class="admin-input" bind:value={editingArticle.readingTime} placeholder="3 min" />
                </div>

                <div style="margin-bottom: 14px;">
                  <label class="admin-label" for="article-status">STATUS</label>
                  <select id="article-status" class="admin-select" bind:value={editingArticle.status}>
                    <option value="published">Publicado (Indexável)</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>

                <div style="margin-bottom: 14px;">
                  <label class="admin-label" for="article-geo">CONTEXTO GEO (MANAUS / AMAZÔNIA)</label>
                  <input id="article-geo" class="admin-input" bind:value={editingArticle.geoContext} />
                </div>
              </div>

              <!-- Cover Image Picker -->
              <div class="admin-card" style="padding: 20px;">
                <h4 style="font: 600 15px var(--display); margin: 0 0 16px;">Foto de Capa</h4>
                <div style="margin-bottom: 12px;">
                  <label class="admin-label" for="article-cover">URL DA IMAGEM (OU ESCOLHA DA CENTRAL)</label>
                  <input id="article-cover" class="admin-input" bind:value={editingArticle.coverImage} placeholder="/uploads/exemplo.webp" />
                </div>
                {#if editingArticle.coverImage}
                  <div style="border: 1px solid #2f3e36; border-radius: 3px; overflow: hidden; margin-top: 10px;">
                    <img src={editingArticle.coverImage} alt="Preview da capa" style="width: 100%; height: 140px; object-fit: cover;" />
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {:else}
        <!-- Articles List -->
        <div class="admin-card">
          <div class="admin-card-header">
            <div>
              <h2 class="admin-card-title">Artigos do Blog</h2>
              <span class="mono" style="font-size: 11px; color: #879288;">
                {articles.length} publicações indexáveis com suporte a SEO, AEO e GEO
              </span>
            </div>
            <button type="button" class="admin-btn" onclick={startNewArticle}>
              + Novo Artigo
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            {#each articles as a (a.slug)}
              <div
                style="background: #131718; border: 1px solid #232c29; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-radius: 3px;"
              >
                <div>
                  <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
                    <span class="admin-badge">{a.category}</span>
                    <span class="mono" style="font-size: 11px; color: #7f8a81;">
                      {a.date} · {a.readingTime}
                    </span>
                    {#if a.status === 'draft'}
                      <span style="font: 9px var(--mono); background: #37281a; color: #e4aa6b; padding: 2px 6px; border-radius: 2px;">
                        RASCUNHO
                      </span>
                    {:else}
                      <span style="font: 9px var(--mono); background: #192b1f; color: #84c093; padding: 2px 6px; border-radius: 2px;">
                        PUBLICADO
                      </span>
                    {/if}
                  </div>
                  <h3 style="font: 600 20px var(--display); margin: 0 0 6px;">
                    <a href={`/blog/${a.slug}/`} target="_blank" style="color: #f1f3ed;">
                      {a.title}
                    </a>
                  </h3>
                  <p style="font-size: 13px; color: #9ba49b; margin: 0; max-width: 800px;">
                    {a.description}
                  </p>
                </div>

                <div style="display: flex; gap: 10px; align-items: center;">
                  <a
                    href={`/blog/${a.slug}/`}
                    target="_blank"
                    class="admin-btn admin-btn-secondary"
                    style="font-size: 11px; padding: 8px 14px;"
                  >
                    Ver ↗
                  </a>
                  <button
                    type="button"
                    class="admin-btn"
                    style="font-size: 11px; padding: 8px 14px;"
                    onclick={() => editArticle(a)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="admin-btn admin-btn-danger"
                    style="font-size: 11px; padding: 8px 12px;"
                    onclick={() => deleteArticle(a.slug)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}

    <!-- TAB 3: PROJECTS -->
    {#if activeTab === 'projects'}
      {#if editingProject}
        <div class="admin-card">
          <div class="admin-card-header">
            <h2 class="admin-card-title">
              {isNewProject ? 'Novo Projeto' : `Editando: ${editingProject.title}`}
            </h2>
            <div style="display: flex; gap: 12px;">
              <button type="button" class="admin-btn admin-btn-secondary" onclick={() => (editingProject = null)}>
                Cancelar
              </button>
              <button type="button" class="admin-btn" onclick={saveProject}>
                Salvar Projeto
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">
            <div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div>
                  <label class="admin-label" for="proj-id">ID / IDENTIFICADOR</label>
                  <input id="proj-id" class="admin-input" bind:value={editingProject.id} placeholder="cotinhas" />
                </div>
                <div>
                  <label class="admin-label" for="proj-title">NOME DO PROJETO</label>
                  <input id="proj-title" class="admin-input" bind:value={editingProject.title} placeholder="Cotinhas" />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div>
                  <label class="admin-label" for="proj-type">TIPO (EYEBROW)</label>
                  <input id="proj-type" class="admin-input" bind:value={editingProject.type} placeholder="FINTECH · SAAS" />
                </div>
                <div>
                  <label class="admin-label" for="proj-label">LABEL EM DESTAQUE</label>
                  <input id="proj-label" class="admin-input" bind:value={editingProject.label} placeholder="Engenharia de pagamentos" />
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <label class="admin-label" for="proj-desc">DESCRIÇÃO CURTA</label>
                <textarea id="proj-desc" class="admin-textarea" style="min-height: 80px;" bind:value={editingProject.description}></textarea>
              </div>

              <div style="margin-bottom: 20px;">
                <label class="admin-label" for="proj-longdesc">DESCRIÇÃO DETALHADA (CASO DE USO / ARQUITETURA)</label>
                <textarea id="proj-longdesc" class="admin-textarea" bind:value={editingProject.longDescription}></textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div>
                  <label class="admin-label" for="proj-stack">STACK TECNOLÓGICA (SEPARADA POR VÍRGULA)</label>
                  <input
                    id="proj-stack"
                    class="admin-input"
                    value={editingProject.stack.join(', ')}
                    oninput={(e) => {
                      editingProject!.stack = (e.currentTarget.value || '').split(',').map((s) => s.trim()).filter(Boolean);
                    }}
                  />
                </div>
                <div>
                  <label class="admin-label" for="proj-metrics">MÉTRICA / IMPACTO</label>
                  <input id="proj-metrics" class="admin-input" bind:value={editingProject.metrics} placeholder="R$ 12.450 arrecadados no piloto" />
                </div>
              </div>
            </div>

            <div>
              <div class="admin-card" style="padding: 20px; margin-bottom: 20px;">
                <h4 style="font: 600 15px var(--display); margin: 0 0 16px;">Aparência & Visual</h4>
                <div style="margin-bottom: 14px;">
                  <label class="admin-label" for="proj-visual">TIPO VISUAL DE PREVIEW</label>
                  <select id="proj-visual" class="admin-select" bind:value={editingProject.visual}>
                    <option value="finance">Finance / Cotinhas App</option>
                    <option value="receipt">Receipt / NoCapricho</option>
                    <option value="map">Map / Telemetria CEC</option>
                    <option value="editorial">Editorial / AcademiaTech</option>
                    <option value="enterprise">Enterprise / Core Engine</option>
                    <option value="custom">Imagem Personalizada</option>
                  </select>
                </div>
                <div style="margin-bottom: 14px;">
                  <label class="admin-label" for="proj-url">LINK DO PROJETO / LIVE DEMO</label>
                  <input id="proj-url" class="admin-input" bind:value={editingProject.url} placeholder="https://..." />
                </div>
                <div style="margin-bottom: 14px;">
                  <label class="admin-label" for="proj-cover">FOTO / SCREENSHOT (OPCIONAL)</label>
                  <input id="proj-cover" class="admin-input" bind:value={editingProject.coverImage} placeholder="/uploads/projeto.webp" />
                </div>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <div class="admin-card">
          <div class="admin-card-header">
            <div>
              <h2 class="admin-card-title">Projetos do Portfólio</h2>
              <span class="mono" style="font-size: 11px; color: #879288;">
                {projects.length} soluções em produção com schema SoftwareApplication
              </span>
            </div>
            <button type="button" class="admin-btn" onclick={startNewProject}>
              + Novo Projeto
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
            {#each projects as p (p.id)}
              <div style="background: #131718; border: 1px solid #232c29; padding: 24px; border-radius: 3px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                  <div>
                    <span class="admin-badge">{p.type}</span>
                    <h3 style="font: 600 22px var(--display); margin: 10px 0 6px;">{p.title}</h3>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button type="button" class="admin-btn" style="padding: 6px 12px; font-size: 11px;" onclick={() => editProject(p)}>
                      Editar
                    </button>
                    <button type="button" class="admin-btn admin-btn-danger" style="padding: 6px 10px; font-size: 11px;" onclick={() => deleteProject(p.id)}>
                      ✕
                    </button>
                  </div>
                </div>
                <p style="font-size: 13px; color: #9aa49a; line-height: 1.7; margin-bottom: 14px;">
                  {p.description}
                </p>
                <div class="tags" style="margin-bottom: 12px;">
                  {#each p.stack as s}
                    <span>{s}</span>
                  {/each}
                </div>
                {#if p.metrics}
                  <div class="mono" style="font-size: 11px; color: var(--copper);">
                    ↳ {p.metrics}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}

    <!-- TAB 4: MEDIA GALLERY & SHARP WEBP/AVIF CONVERTER -->
    {#if activeTab === 'media'}
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <h2 class="admin-card-title">Central de Fotos & Conversão Automática para WebP e AVIF</h2>
            <span class="mono" style="font-size: 11px; color: #879288;">
              Imagens processadas com Sharp para zero perda de qualidade e máxima compressão
            </span>
          </div>
        </div>

        <!-- Drag & Drop Zone -->
        <label
          class={`dropzone ${isDragOver ? 'dragover' : ''}`}
          ondragover={(e) => { e.preventDefault(); isDragOver = true; }}
          ondragleave={() => (isDragOver = false)}
          ondrop={(e) => {
            e.preventDefault();
            isDragOver = false;
            handleFileUpload(e.dataTransfer?.files || null);
          }}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            style="display: none;"
            onchange={(e) => handleFileUpload(e.currentTarget.files)}
          />
          <div style="font-size: 38px; margin-bottom: 12px;">⚡</div>
          <div style="font: 600 18px var(--display); margin-bottom: 6px;">
            Arraste suas fotos aqui ou clique para selecionar
          </div>
          <p style="font-size: 13px; color: #95a195; margin: 0 auto; max-width: 500px;">
            O pipeline converte automaticamente qualquer imagem para os formatos modernos <b>.webp</b> e <b>.avif</b>, gera miniaturas responsivas e remove metadados EXIF pesados.
          </p>
        </label>

        {#if isUploading}
          <div style="background: #19271e; border: 1px solid #36503c; padding: 18px; margin-top: 20px; border-radius: 3px; font-family: var(--mono); font-size: 12px; color: #bde4c5;">
            {uploadProgress}
          </div>
        {/if}

        <!-- Media Grid -->
        <div style="margin-top: 36px;">
          <h3 style="font: 600 18px var(--display); margin-bottom: 18px;">
            Fotos Otimizadas no Servidor ({mediaList.length})
          </h3>

          {#if mediaList.length === 0}
            <p style="color: #7d877e; font-size: 14px;">Nenhuma imagem enviada ainda. Faça o primeiro upload acima!</p>
          {:else}
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
              {#each mediaList as m (m.id)}
                <div style="background: #131718; border: 1px solid #232c29; border-radius: 3px; overflow: hidden;">
                  <picture>
                    <source srcset={m.avifUrl} type="image/avif" />
                    <source srcset={m.webpUrl} type="image/webp" />
                    <img src={m.fallbackUrl} alt={m.altText} style="width: 100%; height: 190px; object-fit: cover;" loading="lazy" />
                  </picture>
                  <div style="padding: 18px;">
                    <strong style="display: block; font-size: 14px; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      {m.originalName}
                    </strong>
                    <div class="mono" style="font-size: 10px; color: #879288; margin-bottom: 12px;">
                      {m.width}x{m.height}px · Economia: <b style="color: #88c797;">-{m.savingsPercent}%</b>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button
                        type="button"
                        class="admin-btn admin-btn-secondary"
                        style="padding: 6px 10px; font-size: 10px; flex: 1;"
                        onclick={() => copyToClipboard(m.webpUrl, 'Link WebP')}
                      >
                        Copiar WebP
                      </button>
                      <button
                        type="button"
                        class="admin-btn admin-btn-secondary"
                        style="padding: 6px 10px; font-size: 10px; flex: 1;"
                        onclick={() => copyToClipboard(m.avifUrl, 'Link AVIF')}
                      >
                        Copiar AVIF
                      </button>
                      <button
                        type="button"
                        class="admin-btn"
                        style="padding: 6px 10px; font-size: 10px; flex: 1;"
                        onclick={() =>
                          copyToClipboard(
                            `<picture>\n  <source srcset="${m.avifUrl}" type="image/avif">\n  <source srcset="${m.webpUrl}" type="image/webp">\n  <img src="${m.fallbackUrl}" alt="${m.altText}" width="${m.width}" height="${m.height}" loading="lazy">\n</picture>`,
                            'Tag <picture>'
                          )}
                      >
                        Tag &lt;picture&gt;
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- TAB 5: SEO, GEO & PROFILE SETTINGS -->
    {#if activeTab === 'settings'}
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <h2 class="admin-card-title">Configurações Especialistas: SEO, AEO, GEO & Autoridade</h2>
            <span class="mono" style="font-size: 11px; color: #879288;">
              Dados cadastrados geram automaticamente os metadados canônicos e schemas JSON-LD
            </span>
          </div>
          <button type="button" class="admin-btn" onclick={saveProfileSettings}>
            Salvar Configurações
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <div style="margin-bottom: 18px;">
              <label class="admin-label" for="prof-name">NOME COMPLETO</label>
              <input id="prof-name" class="admin-input" bind:value={profile.name} />
            </div>
            <div style="margin-bottom: 18px;">
              <label class="admin-label" for="prof-title">TÍTULO PROFISSIONAL / CARGO</label>
              <input id="prof-title" class="admin-input" bind:value={profile.title} />
            </div>
            <div style="margin-bottom: 18px;">
              <label class="admin-label" for="prof-email">E-MAIL DE CONTATO</label>
              <input id="prof-email" class="admin-input" bind:value={profile.email} />
            </div>
            <div style="margin-bottom: 18px;">
              <label class="admin-label" for="prof-whatsapp">LINK DIRETO DO WHATSAPP</label>
              <input id="prof-whatsapp" class="admin-input" bind:value={profile.whatsapp} />
            </div>
            <div style="margin-bottom: 18px;">
              <label class="admin-label" for="prof-bio">BIOGRAFIA INSTITUCIONAL & PARA LLMs</label>
              <textarea id="prof-bio" class="admin-textarea" bind:value={profile.bio}></textarea>
            </div>
          </div>

          <div>
            <div class="admin-card" style="padding: 20px; background: #131718;">
              <h4 style="font: 600 16px var(--display); margin: 0 0 16px; color: var(--copper);">
                🌎 Parâmetros GEO (Manaus / Amazônia)
              </h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label class="admin-label" for="geo-city">CIDADE</label>
                  <input id="geo-city" class="admin-input" bind:value={profile.location.city} />
                </div>
                <div>
                  <label class="admin-label" for="geo-state">ESTADO</label>
                  <input id="geo-state" class="admin-input" bind:value={profile.location.state} />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div>
                  <label class="admin-label" for="geo-lat">LATITUDE</label>
                  <input id="geo-lat" type="number" step="any" class="admin-input" bind:value={profile.location.latitude} />
                </div>
                <div>
                  <label class="admin-label" for="geo-lon">LONGITUDE</label>
                  <input id="geo-lon" type="number" step="any" class="admin-input" bind:value={profile.location.longitude} />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div>
                  <label class="admin-label" for="geo-code">CÓDIGO REGIONAL</label>
                  <input id="geo-code" class="admin-input" bind:value={profile.location.regionCode} />
                </div>
                <div>
                  <label class="admin-label" for="geo-cep">CEP</label>
                  <input id="geo-cep" class="admin-input" bind:value={profile.location.postalCode} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>
