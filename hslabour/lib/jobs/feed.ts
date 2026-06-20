import { XMLParser } from 'fast-xml-parser';
import { applyUrl } from './apply';
import { kebab } from '@/lib/utils';
import type { Job } from '@/lib/jobs/types';

function normalise(raw: any): Job | null {
  if (!raw || typeof raw !== 'object') return null;

  const ref = (raw.reference ?? raw.id)?.toString()?.trim();
  const title = raw.title?.toString()?.trim();
  if (!ref || !title) return null;

  const description = raw.description?.toString()?.trim() ?? '';
  const city = (raw.city ?? raw.location)?.toString()?.trim() ?? '';
  const province = raw.province?.toString()?.trim();

  const category = raw.category?.toString()?.trim() ?? '';

  const employmentTypeInput = (raw.type ?? raw.employmentType ?? '');
  const employmentType: Job['employmentType'] = (() => {
    const v = employmentTypeInput.toString().toLowerCase().trim();
    if (v.includes('temp') || v.includes('tes') || v.includes('temporary')) return 'TEMPORARY';
    if (v.includes('part')) return 'PART_TIME';
    if (v.includes('contract')) return 'CONTRACTOR';
    return 'FULL_TIME';
  })();

  // Build salary object
  let salary: Job['salary'] | undefined;
  const min = raw.salaryMin ?? raw.salary_min ?? raw.salarymin;
  const max = raw.salaryMax ?? raw.salary_max ?? raw.salarymax;
  const periodRaw = (raw.salaryPeriod ?? raw.salary_period ?? raw.salaryperiod)?.toString()?.trim().toLowerCase();

  const minNum = min != null ? parseFloat(min) : NaN;
  const maxNum = max != null ? parseFloat(max) : NaN;
  if (!isNaN(minNum) || !isNaN(maxNum)) {
    salary = {
      min: !isNaN(minNum) ? minNum : undefined,
      max: !isNaN(maxNum) ? maxNum : undefined,
      period: (() => {
        if (!periodRaw) return undefined;
        if (periodRaw.includes('hour')) return 'HOUR';
        if (periodRaw.includes('month')) return 'MONTH';
        if (periodRaw.includes('year') || periodRaw.includes('annual')) return 'YEAR';
        return undefined;
      })(),
    };
  }

  const postedAt: string =
    raw.date?.toString()?.trim() ??
    raw.posted?.toString()?.trim() ??
    raw.published?.toString()?.trim() ??
    raw.datePosted?.toString()?.trim() ??
    new Date().toISOString();

  const closesAt: string | undefined =
    raw.expiry?.toString()?.trim() ??
    raw.closes?.toString()?.trim() ??
    raw.validThrough?.toString()?.trim();

  const slug = `${kebab(title)}-${ref}`;

  return {
    ref,
    slug,
    title,
    description,
    city,
    province,
    category,
    employmentType,
    salary,
    postedAt,
    closesAt,
    applyUrl: applyUrl(ref),
  };
}

export async function fetchJobs(): Promise<Job[]> {
  const feedUrl = process.env.PP_FEED_URL;
  if (!feedUrl) {
    console.warn('PP_FEED_URL is not set; returning empty jobs array.');
    return [];
  }

  try {
    const res = await fetch(feedUrl, { next: { revalidate: 3600, tags: ['jobs'] } });
    if (!res.ok) {
      console.warn(`PP_FEED_URL returned ${res.status}; returning empty jobs array.`);
      return [];
    }

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
    const parsed = parser.parse(xml);

    // Defensively find the array of job records
    let items: any[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && typeof parsed === 'object') {
      // Search for the first property that is an array
      const keys = Object.keys(parsed);
      for (const key of keys) {
        if (Array.isArray(parsed[key])) {
          items = parsed[key];
          break;
        }
      }
    }

    const jobs: Job[] = [];
    for (const item of items) {
      const job = normalise(item);
      if (job) jobs.push(job);
    }
    return jobs;
  } catch (e) {
    console.warn('Failed to fetch or parse PP_FEED_URL:', e);
    return [];
  }
}

export async function getJob(slug: string): Promise<Job | undefined> {
  const jobs = await fetchJobs();
  return jobs.find((j) => j.slug === slug);
}