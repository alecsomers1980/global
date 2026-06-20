import { fetchJobs, getJob } from '@/lib/jobs/feed';
import { stripHtml } from '@/lib/utils';
import JobPostingJsonLd from '@/components/jobs/JobPostingJsonLd';
import { notFound } from 'next/navigation';
import type { Job } from '@/lib/jobs/types';

export const revalidate = 3600;

export async function generateStaticParams() {
  const jobs = await fetchJobs();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  const description = stripHtml(job.description).substring(0, 155) || undefined;
  return {
    title: `${job.title} — ${job.city} | H&S Labour`,
    description,
  };
}

const employmentTypeLabel: Record<Job['employmentType'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACTOR: 'Contract',
  TEMPORARY: 'Temporary',
};

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  return (
    <>
      <JobPostingJsonLd job={job} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <a
          href="/jobs"
          className="inline-block mb-6 text-blue-700 hover:underline focus:outline-none focus:underline"
        >
          &larr; Back to all vacancies
        </a>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-6">
          <span>
            {job.city}
            {job.province ? `, ${job.province}` : ''}
          </span>
          {job.category && <span className="px-2 py-0.5 bg-gray-100 rounded text-sm">{job.category}</span>}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {employmentTypeLabel[job.employmentType]}
          </span>
        </div>

        <div
          className="prose prose-sm max-w-none text-gray-800 mb-8"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />

        <a
          href={job.applyUrl}
          rel="nofollow"
          className="inline-block px-6 py-3 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition-colors"
        >
          Apply on PlacementPartner
        </a>
      </article>
    </>
  );
}