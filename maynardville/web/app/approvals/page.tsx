import { requireStaff } from "@/lib/session";
import { listCompRequestRows } from "@/lib/comps";
import ApprovalQueue from "./ApprovalQueue";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const staff = requireStaff(["Admin"]);
  const rows = await listCompRequestRows(["REQUEST"]);

  return (
    <div className="min-h-screen bg-[#060A3C] font-sans text-[#FFFADB]">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#0F3193]/20">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-bold">Maynardville</h1>
          <p className="text-sm text-[#FFFADB]/70">Approvals</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#62DAA9]">{staff.name} ({staff.role})</span>
          <Link
            href="/api/auth/logout"
            className="underline underline-offset-2 hover:text-[#62DAA9] transition-colors"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ApprovalQueue rows={rows} />
      </main>
    </div>
  );
}