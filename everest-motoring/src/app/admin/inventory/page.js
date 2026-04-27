import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AiVideoStatus from "./AiVideoStatus";
import InventoryTable from "./InventoryTable";
import SeoBatchButton from "./SeoBatchButton";
import { pingDeletedVehicle } from "./seo_actions";

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

        // Fetch the row first so we can build the canonical URL for IndexNow after delete
        const { data: car } = await supabaseAdmin
            .from("cars")
            .select("id, make, model, year")
            .eq("id", carId)
            .single();

        const { error } = await supabaseAdmin.from("cars").delete().eq("id", carId);

        if (error) {
            console.error("Error deleting car:", error);
        } else {
            revalidatePath("/admin/inventory");
            revalidatePath("/inventory"); // Wipe the public cache too
            if (car) {
                pingDeletedVehicle(car).catch((err) => console.warn("IndexNow ping failed:", err));
            }
        }
    }

    // Fetch all cars (including reserved/sold for admin view)
    const { data: cars } = await supabase
        .from('cars')
        .select('*, sales(sold_at)')
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 max-w-7xl mx-auto w-full text-white">
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Manage <span className="text-primary italic">Inventory</span></h1>
                    <p className="text-slate-400 mt-1 font-medium">Real-time control over showroom listings and vehicle status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <SeoBatchButton />
                    <a href="/admin/inventory/add" className="bg-primary hover:bg-primary-dark transition-all px-6 py-3 rounded-xl font-black text-black shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add Vehicle
                    </a>
                </div>
            </div>

            <InventoryTable initialCars={cars || []} deleteCarAction={deleteCar} />
        </div>
    );
}
