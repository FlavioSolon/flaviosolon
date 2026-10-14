<script lang="ts">
  interface Props {
    whatsappUrl: string;
    currentPath?: string;
  }

  let { whatsappUrl = '#', currentPath = '/' }: Props = $props();

  let isOpen = $state(false);

  function closeMenu() {
    isOpen = false;
  }
</script>

<header class="header">
  <a class="wordmark" href="/" aria-label="Flávio Sólon, início">
    flávio sól<span class="logo-o">o</span>n
    <span class="logo-dot">.</span>
    <span class="wordmark-sub">SOFTWARE ENGINEER</span>
  </a>

  <nav class={isOpen ? "nav open" : "nav"} aria-label="Navegação principal">
    <a href="/#sobre" onclick={closeMenu}>Sobre</a>
    <a href="/#projetos" onclick={closeMenu}>Projetos</a>
    <a href="/#essencia" onclick={closeMenu}>Essência</a>
    <a href="/#abordagem" onclick={closeMenu}>Abordagem</a>
    <a href="/blog/" onclick={closeMenu} aria-current={currentPath.startsWith('/blog') ? 'page' : undefined}>Artigos</a>
  </nav>

  <a
    class="header-contact"
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
  >
    WhatsApp <span aria-hidden="true">↗</span>
  </a>

  <button
    type="button"
    class="menu-toggle"
    aria-label={isOpen ? "Fechar navegação" : "Abrir navegação"}
    aria-expanded={isOpen}
    onclick={() => (isOpen = !isOpen)}
  >
    {isOpen ? '✕' : '☰'}
  </button>
</header>
