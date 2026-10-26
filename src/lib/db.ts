import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'src/data');

function readJson<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Erro ao ler ${filename}:`, err);
    return fallback;
  }
}

function writeJson<T>(filename: string, data: T): boolean {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Erro ao salvar ${filename}:`, err);
    return false;
  }
}

export interface Profile {
  name: string;
  site: string;
  email: string;
  whatsapp: string;
  phone: string;
  title: string;
  tagline: string;
  bio: string;
  location: {
    city: string;
    state: string;
    country: string;
    countryCode: string;
    regionCode: string;
    latitude: number;
    longitude: number;
    postalCode: string;
  };
  socials: { name: string; url: string; username?: string }[];
  skills: string[];
}

export interface ArticleSection {
  title: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingTime: string;
  status: 'published' | 'draft';
  coverImage?: string;
  coverImageAvif?: string;
  coverImageWebp?: string;
  tags?: string[];
  aeoSummary?: string;
  geoContext?: string;
  /** Rótulo curto exibido no card visual da listagem do blog (ex.: "ARQUITETURA"). */
  markLabel?: string;
  /** Chamada para ação opcional exibida ao final do artigo (links para a Home e WhatsApp). */
  cta?: { heading: string; text: string };
  sections: ArticleSection[];
}

export interface Project {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  longDescription: string;
  stack: string[];
  filters: string[];
  visual: string;
  label: string;
  featured: boolean;
  metrics?: string;
  url?: string;
  isPrivate?: boolean;
  githubUrl?: string;
  coverImage?: string;
  coverImageAvif?: string;
  coverImageWebp?: string;
  schemaType?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface MediaItem {
  id: string;
  name: string;
  originalName: string;
  webpUrl: string;
  avifUrl: string;
  fallbackUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  originalSize: number;
  webpSize: number;
  avifSize: number;
  savingsPercent: number;
  createdAt: string;
  altText: string;
}

// Profile API
export function getProfile(): Profile {
  return readJson<Profile>('profile.json', {} as Profile);
}

export function updateProfile(data: Partial<Profile>): Profile {
  const current = getProfile();
  const updated = { ...current, ...data };
  writeJson('profile.json', updated);
  return updated;
}

// Articles API
export function getArticles(includeDrafts = false): Article[] {
  const all = readJson<Article[]>('articles.json', []);
  if (includeDrafts) return all;
  return all.filter((a) => a.status === 'published' || !a.status);
}

export function getArticleBySlug(slug: string): Article | undefined {
  const articles = readJson<Article[]>('articles.json', []);
  return articles.find((a) => a.slug === slug);
}

export function saveArticle(article: Article): Article {
  const articles = readJson<Article[]>('articles.json', []);
  const index = articles.findIndex((a) => a.slug === article.slug);
  if (index >= 0) {
    articles[index] = article;
  } else {
    articles.unshift(article);
  }
  writeJson('articles.json', articles);
  return article;
}

export function deleteArticle(slug: string): boolean {
  const articles = readJson<Article[]>('articles.json', []);
  const filtered = articles.filter((a) => a.slug !== slug);
  if (filtered.length === articles.length) return false;
  return writeJson('articles.json', filtered);
}

// Projects API
export function getProjects(): Project[] {
  return readJson<Project[]>('projects.json', []);
}

export function getProjectById(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}

export function saveProject(project: Project): Project {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  writeJson('projects.json', projects);
  return project;
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  return writeJson('projects.json', filtered);
}

// FAQs API
export function getFaqs(): FAQ[] {
  return readJson<FAQ[]>('faqs.json', []);
}

export function saveFaqs(faqs: FAQ[]): boolean {
  return writeJson('faqs.json', faqs);
}

// Media API
export function getMedia(): MediaItem[] {
  return readJson<MediaItem[]>('media.json', []);
}

export function saveMediaItem(item: MediaItem): MediaItem {
  const media = getMedia();
  media.unshift(item);
  writeJson('media.json', media);
  return item;
}

export function deleteMediaItem(id: string): boolean {
  const media = getMedia();
  const filtered = media.filter((m) => m.id !== id);
  if (filtered.length === media.length) return false;
  return writeJson('media.json', filtered);
}
