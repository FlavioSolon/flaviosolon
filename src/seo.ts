import { articles } from "./content/articles"
import { profile } from "./profile"
import { faqs } from "./content/faqs"

export function metadata(path: string) {
  const article = articles.find(
    (a) => path.replace(/\/$/, "") === `/blog/${a.slug}`,
  )
  const isBlog = path.startsWith("/blog")
  const title = article
    ? `${article.title} | Flávio Sólon`
    : isBlog
      ? "Artigos de engenharia de software | Flávio Sólon"
      : "Flávio Sólon | Da missão ao código — Desenvolvedor em Manaus"
  const description =
    article?.description ??
    (isBlog
      ? "Artigos de Flávio Sólon sobre arquitetura, Rust, Laravel e software resiliente. Tecnologia com propósito e impacto real."
      : "Flávio Sólon, desenvolvedor e engenheiro de software em Manaus. Rust, Laravel, Svelte, Angular e Astro. Desenvolvimento com propósito e impacto real, com atuação remota.")
  const url = `${profile.site}${
    article ? `/blog/${article.slug}/` : isBlog ? "/blog/" : "/"
  }`
  const person = {
    "@type": "Person",
    "@id": `${profile.site}/#person`,
    name: profile.name,
    url: `${profile.site}/`,
    email: profile.email,
    jobTitle: "Full-Stack Software Engineer",
    sameAs: profile.socials.map((s) => s.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Manaus",
      addressRegion: "Amazonas",
      addressCountry: "BR",
    },
    knowsAbout: [
      "Rust",
      "Laravel",
      "Svelte",
      "Angular",
      "Astro",
      "Arquitetura de software",
    ],
  }
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${profile.site}/#website`,
        name: "Flávio Sólon — Da missão ao código",
        url: `${profile.site}/`,
        inLanguage: "pt-BR",
        publisher: { "@id": person["@id"] },
      },
      {
        "@type": article
          ? "WebPage"
          : isBlog
            ? "CollectionPage"
            : "ProfilePage",
        "@id": `${url}#page`,
        url,
        name: title,
        description,
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${profile.site}/#website` },
        mainEntity: article
          ? { "@id": `${url}#article` }
          : isBlog
            ? { "@id": `${url}#blog` }
            : { "@id": person["@id"] },
      },
      ...(article
        ? [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              headline: article.title,
              description,
              datePublished: article.date,
              dateModified: article.date,
              author: { "@id": person["@id"] },
              publisher: { "@id": person["@id"] },
              mainEntityOfPage: { "@id": `${url}#page` },
              inLanguage: "pt-BR",
              articleSection: article.category,
              articleBody: article.sections
                .map((s) => `${s.title}\n${s.paragraphs.join("\n")}`)
                .join("\n\n"),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Início",
                  item: `${profile.site}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Artigos",
                  item: `${profile.site}/blog/`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: article.title,
                  item: url,
                },
              ],
            },
          ]
        : isBlog
          ? [
              {
                "@type": "Blog",
                "@id": `${url}#blog`,
                name: "Artigos de Flávio Sólon",
                url,
                author: { "@id": person["@id"] },
                blogPost: articles.map((a) => ({
                  "@type": "BlogPosting",
                  headline: a.title,
                  url: `${profile.site}/blog/${a.slug}/`,
                  datePublished: a.date,
                  author: { "@id": person["@id"] },
                })),
              },
            ]
          : [
              {
                "@type": "FAQPage",
                "@id": `${url}#faq`,
                mainEntity: faqs.map(([question, answer]) => ({
                  "@type": "Question",
                  name: question,
                  acceptedAnswer: { "@type": "Answer", text: answer },
                })),
              },
              {
                "@type": "Service",
                name: "Desenvolvimento de software",
                provider: { "@id": person["@id"] },
                serviceType: [
                  "Desenvolvimento web",
                  "Arquitetura de software",
                  "Engenharia de SaaS",
                ],
                areaServed: "Worldwide",
              },
            ]),
    ],
  }
  return { title, description, url, schema }
}
