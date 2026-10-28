import type { APIRoute } from "astro"
import { getArticles } from "@/lib/db"

export const GET: APIRoute = async () => {
  const articles = getArticles(false)
  const siteUrl = "https://flaviosolon.com"

  const itemsXml = articles
    .map((article) => {
      const pubDate = new Date(`${article.date}T10:00:00-04:00`).toUTCString()
      const articleUrl = `${siteUrl}/blog/${article.slug}/`
      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${article.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>contato@flaviosolon.com (Flávio Sólon)</author>
      <category><![CDATA[${article.category}]]></category>
    </item>`
    })
    .join("\n")

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flávio Sólon — Artigos de Engenharia de Software</title>
    <link>${siteUrl}/blog/</link>
    <description>Notas sobre arquitetura de software, SaaS, Rust, Laravel, Svelte 5, Angular e Astro por Flávio Sólon.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`

  return new Response(rssFeed.trim(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
