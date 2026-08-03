import { requireStaff } from "@/lib/session";
import { getCompDashboard } from "@/lib/dashboard";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";

export const dynamic = "force-dynamic";

export default async function SponsorshipPage() {
  const staff = requireStaff(["Sponsorships", "Admin"]);
  const data = await getCompDashboard([
    "Partner / Sponsor",
    "Competition Winners",
  ]);

  return (
    <DepartmentDashboard
      title="Sponsorship"
      staffName={staff.name}
      data={data}
    />
  );
}