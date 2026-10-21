import { getProfile, getArticles, getArticleBySlug, getProjects, getProjectById, getFaqs } from './db';
import type { Article, Project } from './db';

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article' | 'profile';
  ogImage: string;
  article?: Article;
  project?: Project;
  jsonLd: Record<string, unknown>;
  geo: {
    region: string;
    placename: string;
    position: string;
    icbm: string;
  };
}

export function generateSeo(path: string): SeoMetadata {
  const profile = getProfile();
  const cleanPath = path.replace(/\/$/, '') || '/';
  const siteUrl = profile.site.replace(/\/$/, '');
  const canonicalUrl = `${siteUrl}${cleanPath === '/' ? '/' : `${cleanPath}/`}`;
  const defaultOgImage = `${siteUrl}/og-image.jpg`;

  const geo = {
    region: profile.location.regionCode || 'BR-AM',
    placename: `${profile.location.city}, ${profile.location.state}, ${profile.location.country}`,
    position: `${profile.location.latitude};${profile.location.longitude}`,
    icbm: `${profile.location.latitude}, ${profile.location.longitude}`,
  };

  const websiteEntity = {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: 'Flávio Sólon — Engenharia de Software Full-Stack',
    inLanguage: 'pt-BR',
    publisher: { '@id': `${siteUrl}/#person` },
  };

  const personEntity = {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Flávio Sólon',
    givenName: 'Flávio Sólon',
    familyName: 'Araújo Dutra',
    legalName: 'Flávio Sólon Araújo Dutra',
    alternateName: [
      'Flávio Sólon Araújo Dutra',
      'Flavio Solon',
      'Flavio Solon Araujo Dutra',
    ],
    url: `${siteUrl}/`,
    image: `${siteUrl}/og-image.jpg`,
    email: 'mailto:contato@flaviosolon.com',
    telephone: '+55-92-98416-7784',
    jobTitle: 'Senior Full-Stack Software Engineer & Solutions Architect',
    description:
      'Desenvolvedor Full-Stack Sênior (Hands-on) baseado em Manaus, Amazonas, Brasil (Brazil). Especialista em desenvolvimento de software sob medida, plataformas SaaS, EAD, sistemas de rastreamento veicular, marketplaces e refatoração de sistemas críticos utilizando Rust, PHP (Laravel), Svelte 5, Angular, React, Vue.js e Astro.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Manaus',
      addressRegion: 'AM',
      addressCountry: 'BR',
    },
    nationality: {
      '@type': 'Country',
      name: 'Brazil',
    },
    knowsLanguage: ['pt-BR', 'en'],
    knowsAbout: [
      'Full-Stack Software Development',
      'Rust Programming Language',
      'Laravel & PHP',
      'Svelte 5 & SvelteKit',
      'Angular',
      'Astro',
      'React & Vue.js',
      'SaaS & Micro-SaaS Architecture',
      'Plataformas EAD e Sistemas Educacionais',
      'Sistemas de Rastreamento Veicular e Telemetria',
      'Marketplaces e E-commerce',
      'Karatê Shinkyokushin',
      'Kickboxing',
      'Violão Clássico e Erudito',
    ],
    sameAs: [
      'https://github.com/FlavioSolon',
      'https://www.linkedin.com/in/flaviosolon',
      'https://www.instagram.com/flaviosolon_/',
      'https://x.com/flaviosolon_',
    ],
  };

  const businessEntity = {
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}/#service`,
    name: 'Flávio Sólon — Desenvolvimento de Software sob Medida (Manaus & Brasil)',
    url: `${siteUrl}/`,
    image: `${siteUrl}/og-image.jpg`,
    email: 'contato@flaviosolon.com',
    telephone: '+55-92-98416-7784',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Manaus',
      addressRegion: 'AM',
      addressCountry: 'BR',
    },
    areaServed: [
      { '@type': 'City', name: 'Manaus' },
      { '@type': 'State', name: 'Amazonas' },
      { '@type': 'Country', name: 'Brasil' },
      { '@type': 'Country', name: 'Brazil' },
    ],
    founder: { '@id': `${siteUrl}/#person` },
  };

  // Case 1: Blog Article page (`/blog/[slug]`)
  if (cleanPath.startsWith('/blog/') && cleanPath !== '/blog') {
    const slug = cleanPath.replace('/blog/', '');
    const article = getArticleBySlug(slug);

    if (article) {
      const title = `${article.title} | ${profile.name}`;
      const description = article.description;
      const ogImage = article.coverImage || defaultOgImage;

      const blogPostingEntity = {
        '@type': 'BlogPosting',
        '@id': `${canonicalUrl}#article`,
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        dateModified: article.date,
        author: { '@id': personEntity['@id'] },
        publisher: { '@id': personEntity['@id'] },
        mainEntityOfPage: { '@id': `${canonicalUrl}#page` },
        inLanguage: 'pt-BR',
        articleSection: article.category,
        keywords: article.tags?.join(', ') || article.category,
        articleBody: article.sections
          .map((s) => `${s.title}\n${s.paragraphs.join('\n')}`)
          .join('\n\n'),
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.reading-header h1', '.aeo-direct-answer', '.article-prose p:first-of-type'],
        },
      };

      const breadcrumbEntity = {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Artigos', item: `${siteUrl}/blog/` },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
        ],
      };

      const pageEntity = {
        '@type': 'ItemPage',
        '@id': `${canonicalUrl}#page`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': websiteEntity['@id'] },
        mainEntity: { '@id': blogPostingEntity['@id'] },
      };

      return {
        title,
        description,
        canonicalUrl,
        ogType: 'article',
        ogImage,
        article,
        geo,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [personEntity, websiteEntity, pageEntity, blogPostingEntity, breadcrumbEntity],
        },
      };
    }
  }

  // Case 2: Blog index page (`/blog`)
  if (cleanPath === '/blog') {
    const articles = getArticles();
    const title = `Artigos de engenharia e tecnologia | ${profile.name}`;
    const description = `Notas de ${profile.name} sobre arquitetura de software, Rust, Laravel, Svelte e tolerância a falhas na Amazônia.`;

    const blogEntity = {
      '@type': 'Blog',
      '@id': `${canonicalUrl}#blog`,
      name: `Artigos de ${profile.name}`,
      description,
      url: canonicalUrl,
      author: { '@id': personEntity['@id'] },
      blogPost: articles.map((a) => ({
        '@type': 'BlogPosting',
        headline: a.title,
        description: a.description,
        url: `${siteUrl}/blog/${a.slug}/`,
        datePublished: a.date,
        author: { '@id': personEntity['@id'] },
      })),
    };

    const breadcrumbEntity = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Artigos', item: canonicalUrl },
      ],
    };

    const pageEntity = {
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#page`,
      url: canonicalUrl,
      name: title,
      description,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': websiteEntity['@id'] },
      mainEntity: { '@id': blogEntity['@id'] },
    };

    return {
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      ogImage: defaultOgImage,
      geo,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [personEntity, websiteEntity, pageEntity, blogEntity, breadcrumbEntity],
      },
    };
  }

  // Case 3: Project detail page (`/projetos/[id]`)
  if (cleanPath.startsWith('/projetos/')) {
    const id = cleanPath.replace('/projetos/', '');
    const project = getProjectById(id);

    if (project) {
      const title = `${project.title} — ${project.label} | ${profile.name}`;
      const description = project.longDescription || project.description;
      const ogImage = project.coverImage || defaultOgImage;

      const appEntity = {
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software`,
        name: project.title,
        description: project.description,
        applicationCategory: project.category,
        operatingSystem: 'Web, Multiplataforma',
        author: { '@id': personEntity['@id'] },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'BRL',
        },
      };

      const breadcrumbEntity = {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Projetos', item: `${siteUrl}/#projetos` },
          { '@type': 'ListItem', position: 3, name: project.title, item: canonicalUrl },
        ],
      };

      const pageEntity = {
        '@type': 'ItemPage',
        '@id': `${canonicalUrl}#page`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': websiteEntity['@id'] },
        mainEntity: { '@id': appEntity['@id'] },
      };

      return {
        title,
        description,
        canonicalUrl,
        ogType: 'website',
        ogImage,
        project,
        geo,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [personEntity, websiteEntity, pageEntity, appEntity, breadcrumbEntity],
        },
      };
    }
  }

  // Default / Home Page (`/`)
  const faqs = getFaqs();
  const title = `${profile.name} | Da missão ao código — Desenvolvedor em Manaus`;
  const description =
    'Flávio Sólon (Flávio Sólon Araújo Dutra) — Engenheiro de Software Full-Stack em Manaus. Especialista em Rust, Laravel, Svelte 5, Angular e Astro.';

  const faqEntity = {
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    ogImage: defaultOgImage,
    geo,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [websiteEntity, personEntity, businessEntity, faqEntity],
    },
  };
}
