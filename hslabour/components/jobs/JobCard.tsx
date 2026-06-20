import Link from 'next/link';
import type { Job } from '@/lib/jobs/types';

const employmentTypeLabel: Record<Job['employmentType'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACTOR: 'Contract',
  TEMPORARY: 'Temporary',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function JobCard({ job }: { job: Job }) {
  const location =
    job.province ? `${job.city}, ${job.province}` : job.city;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
      aria-label={`View job: ${job.title}`}
    >
      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
        {job.title}
      </h2>
      <p className="mt-1 text-sm text-gray-500">{location}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {job.category && (
          <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {job.category}
          </span>
        )}
        <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          {employmentTypeLabel[job.employmentType]}
        </span>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        Posted {formatDate(job.postedAt)}
      </p>
    </Link>
  );
}