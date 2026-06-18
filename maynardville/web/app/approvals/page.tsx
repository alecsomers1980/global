import { requireStaff } from "@/lib/session";
import { listCompRequestRows } from "@/lib/comps";
import ApprovalQueue from "./ApprovalQueue";
import AppHeader from "@/components/ui/AppHeader";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const staff = requireStaff(["Admin"]);
  const rows = await listCompRequestRows(["REQUEST"]);

  return (
    <div className="min-h-screen bg-mv-canvas">
      <AppHeader title="Approvals" staffName={staff.name} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ApprovalQueue rows={rows} />
      </main>
    </div>
  );
}