import type { Metadata } from 'next';
import Link from 'next/link';
import { JOBS_SOURCE } from '@/lib/jobs/config';
import { fetchJobs } from '@/lib/jobs/feed';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import PlacementPartnerEmbed from '@/components/jobs/PlacementPartnerEmbed';
import Container from '@/components/site/Container';
import PageHeader from '@/components/site/PageHeader';
import ParallaxSection from '@/components/site/ParallaxSection';
import ClosingCta from '@/components/site/ClosingCta';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Job Vacancies — H&S Labour Brokers South Africa',
  description:
    'Find permanent, contract and temporary employment services (TES) jobs across Johannesburg, Cape Town, Durban, Pretoria and Gqeberha. H&S Labour Brokers connects skilled candidates with top employers.',
  alternates: { canonical: '/jobs' },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string; q?: string }>;
}) {
  const sp = await searchParams;

  if (JOBS_SOURCE === 'iframe') {
    return (
      <>
        <PageHeader
          eyebrow="Careers"
          title="Current vacancies"
          intro="H&S Labour Brokers supplies permanent, contract and TES candidates across South Africa — construction, engineering, manufacturing, logistics, facilities management, cleaning, security and healthcare, with deep coverage in Johannesburg, Cape Town, Durban, Pretoria and Gqeberha."
          imageSrc="/images/careers-people.jpg"
          imageAlt="Candidates placed by H&S Labour Brokers"
        />
        <section className="bg-white py-16 sm:py-20">
          <Container>
            <PlacementPartnerEmbed />
            <noscript>
              <p className="mt-4 text-sm text-slate-500">
                Your browser doesn&apos;t support the embedded jobs list.{' '}
                <a
                  href={process.env.NEXT_PUBLIC_PP_CAREERS_URL ?? '#'}
                  className="text-green-dark underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View all vacancies on PlacementPartner
                </a>
              </p>
            </noscript>
          </Container>
        </section>
        <ParallaxSection
          image="/images/parallax/team-meeting.jpg"
          eyebrow="Your next role awaits"
          title="Permanent, contract and temporary roles across South Africa"
          subtitle="We place candidates in construction, engineering, manufacturing, logistics, facilities, cleaning, security and healthcare — apply today."
          cta={{ href: '/ebook', label: 'Get the job-hunting e-book' }}
        />
        <ClosingCta />
      </>
    );
  }

  // Feed mode
  const jobs = await fetchJobs();
  const cities = Array.from(new Set(jobs.map((j) => j.city).filter(Boolean))).sort();
  const categories = Array.from(new Set(jobs.map((j) => j.category).filter(Boolean))).sort();

  const cityFilter = sp.city?.toLowerCase();
  const categoryFilter = sp.category?.toLowerCase();
  const searchQuery = sp.q?.toLowerCase().trim();

  let filteredJobs = jobs;
  if (cityFilter) {
    filteredJobs = filteredJobs.filter((j) => j.city.toLowerCase() === cityFilter);
  }
  if (categoryFilter) {
    filteredJobs = filteredJobs.filter((j) => j.category.toLowerCase() === categoryFilter);
  }
  if (searchQuery) {
    filteredJobs = filteredJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(searchQuery) ||
        j.description.toLowerCase().includes(searchQuery),
    );
  }

  // Sort by posted date descending
  filteredJobs = [...filteredJobs].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Job vacancies — South Africa"
        intro="Browse permanent, contract and temporary roles placed by H&S Labour Brokers across Johannesburg, Cape Town, Durban, Pretoria, Gqeberha and surrounding areas."
        imageSrc="/images/careers-people.jpg"
        imageAlt="Candidates placed by H&S Labour Brokers"
      />
      <section className="bg-white py-16 sm:py-20">
        <Container>
          {jobs.length > 0 && <JobFilters cities={cities} categories={categories} />}

          {filteredJobs.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job.slug} job={job} />
              ))}
            </div>
          ) : (
            <div className="mt-16 rounded-2xl bg-slate-50 py-12 text-center">
              <h2 className="text-xl font-semibold text-navy">No vacancies match your filters</h2>
              <p className="mt-2 text-slate-600">
                Try adjusting your search or browsing all current openings.
              </p>
              {jobs.length > 0 && (
                <Link
                  href="/jobs"
                  className="mt-4 inline-block text-green-dark underline hover:text-green"
                >
                  Clear all filters
                </Link>
              )}
            </div>
          )}
        </Container>
      </section>
      <ClosingCta />
    </>
  );
}
