import { requireStaff } from "@/lib/session";
import { getCompDashboard } from "@/lib/dashboard";
import DepartmentDashboard from "@/components/dashboard/DepartmentDashboard";

export const dynamic = "force-dynamic";

export default async function PRMediaPage() {
  const staff = requireStaff(["PR & Media", "Admin"]);
  const data = await getCompDashboard(["Media", "VIP"]);

  return (
    <DepartmentDashboard
      title="PR & Media"
      staffName={staff.name}
      data={data}
    />
  );
}