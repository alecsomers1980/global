import { Job } from '@/lib/jobs/types';

export default function JobPostingJsonLd({ job }: { job: Job }) {
  const baseSalary =
    job.salary && (job.salary.min !== undefined || job.salary.max !== undefined)
      ? {
          '@type': 'MonetaryAmount' as const,
          currency: 'ZAR',
          value: {
            '@type': 'QuantitativeValue' as const,
            ...(job.salary.min !== undefined ? { minValue: job.salary.min } : {}),
            ...(job.salary.max !== undefined ? { maxValue: job.salary.max } : {}),
            ...(job.salary.period ? { unitText: job.salary.period } : {}),
          },
        }
      : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description, // HTML is allowed and expected by Google for Jobs
    datePosted: job.postedAt,
    ...(job.closesAt ? { validThrough: job.closesAt } : {}),
    employmentType: job.employmentType,
    directApply: false,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'H&S Labour Brokers',
      sameAs: 'https://hslabour.co.za',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city,
        ...(job.province ? { addressRegion: job.province } : {}),
        addressCountry: 'ZA',
      },
    },
    ...(baseSalary ? { baseSalary } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}