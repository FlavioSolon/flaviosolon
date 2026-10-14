<script lang="ts">
  const pillars = [
    {
      name: "A disciplina",
      subject: "Karatê Shinkyokushin",
      symbol: "道",
      text: "Foco, constância e calma sob pressão. A mesma disciplina do dojo aplicada a sistemas críticos e execução precisa.",
      code: "Precisão na execução. Segurança por princípio.",
    },
    {
      name: "A harmonia",
      subject: "Violão erudito",
      symbol: "≋",
      text: "Cada voz tem seu lugar. O estudo do contraponto inspira arquiteturas coesas, baixo acoplamento e código que faz sentido.",
      code: "Partes independentes. Um sistema em sintonia.",
    },
    {
      name: "A resiliência",
      subject: "Missões ribeirinhas",
      symbol: "≈",
      text: "Servir na Amazônia ensina a fazer mais com menos. Software acessível, tolerante a falhas e atento à realidade de quem usa.",
      code: "Menos recursos. Mais impacto real.",
    },
  ];

  let selectedIndex = $state(0);
</script>

<div class="pillar-grid">
  {#each pillars as p, i}
    <button
      type="button"
      class={`pillar ${selectedIndex === i ? "selected" : ""}`}
      aria-pressed={selectedIndex === i}
      onclick={() => (selectedIndex = i)}
    >
      <div class="pillar-top">
        <span class="mono">
          0{i + 1} / {p.subject.toUpperCase()}
        </span>
        <span class="pillar-symbol">{p.symbol}</span>
      </div>
      <h3>
        {p.name}<span>.</span>
      </h3>
      <p>{p.text}</p>
      <div class="pillar-code">↳ {p.code}</div>
    </button>
  {/each}
</div>
