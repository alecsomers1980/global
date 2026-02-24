import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AiVideoStatus from "./AiVideoStatus";
import InventoryTable from "./InventoryTable";

export const metadata = {
    title: "Admin Dashboard | Everest Motoring",
};

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Authentication is handled globally by src/app/admin/layout.js

    // Server Action to delete a vehicle
    async function deleteCar(formData) {
        "use server";
        const carId = formData.get("id");
        if (!carId) return;

        const supabaseAdmin = await createAdminClient();
        const { error } = await supabaseAdmin.from("cars").delete().eq("id", carId);

        if (error) {
            console.error("Error deleting car:", error);
        } else {
            revalidatePath("/admin/inventory");
            revalidatePath("/inventory"); // Wipe the public cache too
        }
    }

    // Fetch all cars (including reserved/sold for admin view)
    const { data: cars } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Manage Inventory</h1>
                <a href="/admin/inventory/add" className="bg-primary hover:bg-primary-dark transition-colors px-4 py-2 rounded-md font-bold text-white shadow-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Vehicle
                </a>
            </div>

            <InventoryTable initialCars={cars || []} deleteCarAction={deleteCar} />
        </div>
    );
}
