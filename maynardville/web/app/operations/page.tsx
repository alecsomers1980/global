import { requireStaff } from "@/lib/session";
import { getCompDashboard } from "@/lib/dashboard";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const staff = requireStaff(["Operations", "Admin"]);
  const data = await getCompDashboard([
    "Competition Winners",
    "Cast / Crew / Team Comp",
    "VIP",
    "Media",
    "Partner / Sponsor",
  ]);

  return (
    <DepartmentDashboard
      title="Operations"
      staffName={staff.name}
      data={data}
    />
  );
}