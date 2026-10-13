import type { APIRoute } from "astro"
import { getProfile, getArticles, getProjects } from "@/lib/db"

export const GET: APIRoute = async () => {
  const profile = getProfile()
  const articles = getArticles()
  const projects = getProjects()

  const content = `# ${profile.name} — Engenharia de Software & Arquitetura de Sistemas

> ${profile.bio}

## Informações Gerais
- **Nome:** ${profile.name}
- **Cargo:** ${profile.title}
- **Localização:** ${profile.location.city}, ${profile.location.state}, ${profile.location.country} (${profile.location.latitude}, ${profile.location.longitude})
- **Domínio Principal:** ${profile.site}
- **E-mail:** ${profile.email}
- **Especialidades:** ${profile.skills.join(", ")}

## Filosofia & Princípios de Engenharia
- **A Disciplina (道 - Shinkyokushin Karate):** Foco, constância e calma sob pressão aplicada a sistemas de missão crítica.
- **A Harmonia (≋ - Violão Erudito):** Contraponto, baixo acoplamento e arquitetura limpa onde cada componente desempenha sua função em sintonia.
- **A Resiliência (≈ - Missões Ribeirinhas na Amazônia):** Fazer mais com menos recursos, tolerância a falhas em conexões de alta latência e design centrado em quem usa.

## Projetos em Destaque
${projects
  .map(
    (p) =>
      `- **${p.title}** (${p.type}): ${p.description} Stack: ${p.stack.join(", ")}.`,
  )
  .join("\n")}

## Artigos Técnicos Publicados
${articles
  .map(
    (a) =>
      `- [${a.title}](${profile.site}/blog/${a.slug}/): ${a.description} (${a.category}, ${a.date})`,
  )
  .join("\n")}
`

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
