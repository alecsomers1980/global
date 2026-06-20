import type { Metadata } from 'next';

export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dbib.co.za'
).replace(/\/+$/, '');

export function absoluteUrl(path: string): string {
  const cleanPath = path.replace(/^\/+/, '');
  return `${SITE_URL}/${cleanPath}`;
}

export function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const lastSpace = text.lastIndexOf(' ', max);
  const cutIndex = lastSpace === -1 ? max : lastSpace;
  return text.substring(0, cutIndex) + '...';
}

export function pbFileUrl(
  record: any,
  filename?: string | null
): string | null {
  if (!filename) return null;
  const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (!baseUrl) return null;
  return `${baseUrl}/api/files/${record.collectionId}/${record.id}/${filename}`;
}

export interface BuildMetaArgs {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: 'website' | 'article';
}

export function buildMetadata(args: BuildMetaArgs): Metadata {
  const desc = stripHtml(args.description);
  const plainDescription = truncate(desc, 160);
  const pagePath = args.path || '/';
  const canonical = absoluteUrl(pagePath);
  const imageUrl = args.image
    ? args.image.startsWith('http')
      ? args.image
      : absoluteUrl(args.image)
    : absoluteUrl('/banner.webp');

  return {
    title: args.title,
    description: plainDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: args.title,
      description: plainDescription,
      url: canonical,
      siteName: 'Bushbuckridge Community Directory',
      type: args.type || 'website',
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: args.title,
      description: plainDescription,
      images: [imageUrl],
    },
  };
}
