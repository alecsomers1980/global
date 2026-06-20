import { SITE_URL, absoluteUrl, stripHtml, pbFileUrl } from './seo';

function cleanObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      const filtered = value.filter(
        (v) => v !== undefined && v !== null && v !== ''
      );
      if (filtered.length === 0) continue;
      result[key] = filtered;
    } else if (typeof value === 'object' && value !== null) {
      const cleaned = cleanObject(value);
      if (Object.keys(cleaned).length === 0) continue;
      result[key] = cleaned;
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function organizationLd() {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bushbuckridge Community Directory',
    url: SITE_URL,
    logo: absoluteUrl('/logo.png'),
  });
}

export function websiteLd() {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: 'Bushbuckridge Community Directory',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl('/find-a-service?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
  });
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  });
}

function geoCoordinates(b: any) {
  const lat = Number(b.map_lat);
  const lng = Number(b.map_lng);
  if (
    b.map_lat === '' || b.map_lat == null ||
    b.map_lng === '' || b.map_lng == null ||
    !Number.isFinite(lat) || !Number.isFinite(lng)
  ) {
    return undefined;
  }
  return { '@type': 'GeoCoordinates', latitude: lat, longitude: lng };
}

export function localBusinessLd(b: any) {
  const geo = geoCoordinates(b);
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/business/' + b.id),
    name: b.name,
    description: stripHtml(b.description) || undefined,
    url: absoluteUrl('/business/' + b.id),
    telephone: b.phone,
    email: b.email,
    image: pbFileUrl(b, b.logo) || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address || undefined,
      addressLocality: b.expand?.area?.name || b.area || 'Bushbuckridge',
      addressRegion: 'Mpumalanga',
      addressCountry: 'ZA',
    },
    geo,
    hasMap: geo
      ? `https://maps.google.com/maps?q=${geo.latitude},${geo.longitude}`
      : undefined,
    sameAs: b.website ? [b.website] : undefined,
  });
}

export function eventLd(e: any) {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    startDate: e.date,
    location: {
      '@type': 'Place',
      name: e.venue || 'Bushbuckridge',
      address: 'Bushbuckridge, Mpumalanga, South Africa',
    },
    description: stripHtml(e.description) || undefined,
    image: pbFileUrl(e, e.image) || undefined,
    url: absoluteUrl('/events/' + (e.slug || e.id)),
  });
}

export function jobPostingLd(j: any) {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: j.title,
    description: stripHtml(j.description) || undefined,
    datePosted: j.created,
    validThrough: j.closing_date || undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: j.company || 'Bushbuckridge Community Directory',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: j.location || 'Bushbuckridge',
        addressRegion: 'Mpumalanga',
        addressCountry: 'ZA',
      },
    },
  });
}

export function articleLd(a: any, business?: any) {
  const imageFilename = Array.isArray(a.images) ? a.images[0] : a.images;

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: stripHtml(a.body || a.content || a.excerpt) || undefined,
    datePublished: a.published_at || a.created,
    dateModified: a.updated || undefined,
    author: {
      '@type': 'Organization',
      name: business?.name || 'Bushbuckridge Community Directory',
    },
    image: pbFileUrl(a, imageFilename) || undefined,
    url: absoluteUrl('/articles/' + a.id),
  });
}
