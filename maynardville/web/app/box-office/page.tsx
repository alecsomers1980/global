import { requireStaff } from "@/lib/session";
import { listCompRequestRows } from "@/lib/comps";
import BoxOfficeClient from "./BoxOfficeClient";
import AppHeader from "@/components/ui/AppHeader";

export const dynamic = "force-dynamic";

export default async function BoxOfficePage() {
  const staff = requireStaff(["Box Office", "Admin"]);
  const toIssue = await listCompRequestRows(["TO ISSUE"]);
  const issued = await listCompRequestRows(["ISSUED"]);

  return (
    <div className="min-h-screen bg-mv-canvas">
      <AppHeader title="Box Office" staffName={staff.name} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <BoxOfficeClient toIssue={toIssue} issued={issued} />
      </main>
    </div>
  );
}