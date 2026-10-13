import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { MediaItem } from './db';

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface ProcessedImageResult {
  media: MediaItem;
  htmlSnippet: string;
  markdownSnippet: string;
}

export async function processUploadedImage(
  buffer: Buffer,
  originalFilename: string,
  altText = ''
): Promise<ProcessedImageResult> {
  const hash = crypto.randomBytes(8).toString('hex');
  const safeBaseName = path
    .parse(originalFilename)
    .name.toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);

  const baseFileName = `${safeBaseName}-${hash}`;
  const originalSize = buffer.length;

  // Metadata inspection
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || 800;

  // 1. Generate WebP
  const webpFileName = `${baseFileName}.webp`;
  const webpFilePath = path.join(UPLOADS_DIR, webpFileName);
  const webpBuffer = await sharp(buffer)
    .rotate() // Auto-orient according to EXIF before stripping
    .resize({ width: Math.min(width, 1920), withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
  fs.writeFileSync(webpFilePath, webpBuffer);

  // 2. Generate AVIF (Next-gen format, ultra high compression)
  const avifFileName = `${baseFileName}.avif`;
  const avifFilePath = path.join(UPLOADS_DIR, avifFileName);
  const avifBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: Math.min(width, 1920), withoutEnlargement: true })
    .avif({ quality: 75, effort: 4 })
    .toBuffer();
  fs.writeFileSync(avifFilePath, avifBuffer);

  // 3. Generate Thumbnail in WebP (400px width)
  const thumbFileName = `${baseFileName}-thumb.webp`;
  const thumbFilePath = path.join(UPLOADS_DIR, thumbFileName);
  const thumbBuffer = await sharp(buffer)
    .rotate()
    .resize(400, 300, { fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toBuffer();
  fs.writeFileSync(thumbFilePath, thumbBuffer);

  // 4. Fallback JPG/PNG for legacy clients
  const fallbackFileName = `${baseFileName}.jpg`;
  const fallbackFilePath = path.join(UPLOADS_DIR, fallbackFileName);
  const fallbackBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: Math.min(width, 1920), withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(fallbackFilePath, fallbackBuffer);

  const webpSize = webpBuffer.length;
  const avifSize = avifBuffer.length;
  const smallestSize = Math.min(webpSize, avifSize);
  const savingsPercent = Math.max(0, Math.round(((originalSize - smallestSize) / originalSize) * 100));

  const webpUrl = `/uploads/${webpFileName}`;
  const avifUrl = `/uploads/${avifFileName}`;
  const fallbackUrl = `/uploads/${fallbackFileName}`;
  const thumbnailUrl = `/uploads/${thumbFileName}`;

  const media: MediaItem = {
    id: baseFileName,
    name: safeBaseName,
    originalName: originalFilename,
    webpUrl,
    avifUrl,
    fallbackUrl,
    thumbnailUrl,
    width,
    height,
    originalSize,
    webpSize,
    avifSize,
    savingsPercent,
    createdAt: new Date().toISOString(),
    altText: altText || originalFilename,
  };

  const htmlSnippet = `<picture>
  <source srcset="${avifUrl}" type="image/avif">
  <source srcset="${webpUrl}" type="image/webp">
  <img src="${fallbackUrl}" alt="${media.altText}" width="${width}" height="${height}" loading="lazy" decoding="async">
</picture>`;

  const markdownSnippet = `![${media.altText}](${webpUrl})`;

  return { media, htmlSnippet, markdownSnippet };
}
