import { getRequesterByToken, listActivePerformances, listCategoriesByIds } from "@/lib/airtable";
import { Requester, Performance, Category } from "@/lib/types";
import RequestForm from "./RequestForm";

interface Params {
  token: string;
}

export default async function TokenPage({ params }: { params: Params }) {
  const { token } = params;

  // 1. Verify the requester via token
  const requester: Requester | null = await getRequesterByToken(token);

  if (!requester) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mv-cream px-4">
        <div className="rounded-[3px] border border-mv-navy-muted bg-white p-8 text-center shadow-md max-w-md">
          <h1 className="font-heading text-2xl font-bold text-mv-navy">
            This link is invalid or has expired
          </h1>
          <p className="mt-3 text-mv-navy-muted">
            Please contact the box office for a new link.
          </p>
        </div>
      </main>
    );
  }

  // 2. Load active performances for the current season
  const season = process.env.CURRENT_SEASON ?? "2026";
  let performances: Performance[] = [];
  try {
    performances = await listActivePerformances(season);
  } catch (error) {
    console.error("Failed to load performances", error);
  }

  // 3. Load the categories the requester is allowed to use
  let categories: Category[] = [];
  try {
    categories = await listCategoriesByIds(requester.allowedCategoryIds);
  } catch (error) {
    console.error("Failed to load categories", error);
  }

  const noPerformances = performances.length === 0;

  return (
    <main className="min-h-screen bg-mv-cream px-4 py-8 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Branded header */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-mv-navy">
            Complimentary Ticket Request
          </h1>
          <p className="mt-2 text-lg text-mv-navy-muted">
            Hello, {requester.name}!
          </p>
        </div>

        {noPerformances && (
          <div className="mb-6 rounded-[3px] border border-mv-navy-muted bg-white p-4 text-center text-mv-navy">
            There are no performances scheduled for the current season. Please check back later.
          </div>
        )}

        {!noPerformances && (
          <RequestForm
            requester={requester}
            performances={performances}
            categories={categories}
          />
        )}
      </div>
    </main>
  );
}