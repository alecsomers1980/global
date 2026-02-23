import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AiVideoStatus from "./AiVideoStatus";

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

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 font-bold">Image</th>
                            <th className="p-4 font-bold">Vehicle</th>
                            <th className="p-4 font-bold">Price</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {cars && cars.map((car) => (
                            <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    {car.main_image_url ? (
                                        <img src={car.main_image_url} className="w-16 h-12 object-cover rounded-md border border-slate-200" />
                                    ) : (
                                        <div className="w-16 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined text-xl">directions_car</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-slate-900">{car.year} {car.make} {car.model}</p>
                                    <p className="text-xs text-slate-500">{new Intl.NumberFormat('en-ZA').format(car.mileage)} km • {car.transmission}</p>
                                </td>
                                <td className="p-4 font-bold text-slate-700">
                                    R {new Intl.NumberFormat('en-ZA').format(car.price)}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded-md ${car.status === 'available' ? 'bg-green-100 text-green-700' :
                                        car.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-200 text-slate-600'
                                        }`}>
                                        {car.status}
                                    </span>
                                    <AiVideoStatus carId={car.id} videoUrl={car.video_url} />
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <a href={`/admin/inventory/edit/${car.id}`} className="text-slate-400 hover:text-primary transition-colors p-2" title="Edit Vehicle">
                                        <span className="material-symbols-outlined">edit</span>
                                    </a>
                                    <form action={deleteCar}>
                                        <input type="hidden" name="id" value={car.id} />
                                        <button type="submit" className="text-slate-400 hover:text-red-500 transition-colors p-2" title="Delete Vehicle">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}

                        {(!cars || cars.length === 0) && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">
                                    No vehicles found. Click "Add Vehicle" to build your showroom.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
