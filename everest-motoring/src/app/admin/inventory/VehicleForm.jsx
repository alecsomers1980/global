"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { queueAiWalkaround, optimizeDescriptionAction } from "./ai_actions";
import { pingVehicleUrls, autoFixSeoForCar } from "./seo_actions";

const CAR_FEATURES = {
    "Safety & Security": ["ABS", "Airbags", "Alarm System", "ISOFIX", "Rear Camera", "Parking Sensors", "Lane Assist", "Blind Spot Monitor"],
    "Comfort & Convenience": ["Air Conditioning", "Climate Control", "Cruise Control", "Keyless Entry", "Power Steering", "Power Windows", "Sunroof", "Leather Seats"],
    "Technology & Entertainment": ["Bluetooth", "Navigation", "Premium Audio", "Touchscreen", "Apple CarPlay", "Android Auto", "USB Ports"],
    "Exterior & Performance": ["Alloy Wheels", "Tow Bar", "Roof Rails", "Daytime Running Lights", "Xenon/LED Lights", "Fog Lights", "4WD/AWD"]
};

export default function VehicleForm({ initialData = null }) {
    const router = useRouter();
    const supabase = createClient();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const isEditing = !!initialData;

    // Helper to check if an existing feature was selected
    const hasFeature = (feature) => {
        if (!initialData || !initialData.features) return false;
        return initialData.features.includes(feature);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setIsUploading(true);
        setUploadProgress(10);

        try {
            const formData = new FormData(e.target);
            const scene1File = formData.get("scene1_image");
            const scene2File = formData.get("scene2_image");
            const scene3File = formData.get("scene3_image");
            const galleryFiles = formData.getAll("gallery_images");

            let mainImageUrl = formData.get("main_image_url") || (isEditing ? initialData.main_image_url : null);
            let galleryUrls = isEditing && initialData.gallery_urls ? [...initialData.gallery_urls] : [];

            // Helper to upload a single file
            const uploadFile = async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `vehicles/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('vehicles')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('vehicles')
                    .getPublicUrl(filePath);

                return publicUrlData.publicUrl;
            };

            // 1. Upload to Supabase Storage if new files were selected
            try {
                // Determine total files to track progress
                const validGalleryFiles = galleryFiles.filter(file => file.size > 0);
                const allFilesToUpload = [];
                if (scene1File && scene1File.size > 0) allFilesToUpload.push({ type: 'main', file: scene1File });
                if (scene2File && scene2File.size > 0) allFilesToUpload.push({ type: 'scene2', file: scene2File });
                if (scene3File && scene3File.size > 0) allFilesToUpload.push({ type: 'scene3', file: scene3File });

                validGalleryFiles.forEach(file => {
                    allFilesToUpload.push({ type: 'gallery', file });
                });

                if (allFilesToUpload.length > 0) {
                    setUploadProgress(30);

                    let i = 0;
                    // Note: We need to make sure scene2 is gallery[0] and scene3 is gallery[1]
                    // If building a new car and all images are provided:
                    // newGalleryUrls = [scene2Url, scene3Url, ...galleryUrls]
                    const newGalleryAssets = [];
                    let scene2Url = null;
                    let scene3Url = null;

                    for (const item of allFilesToUpload) {
                        const url = await uploadFile(item.file);
                        if (item.type === 'main') mainImageUrl = url;
                        else if (item.type === 'scene2') scene2Url = url;
                        else if (item.type === 'scene3') scene3Url = url;
                        else if (item.type === 'gallery') newGalleryAssets.push(url);

                        i++;
                        setUploadProgress(30 + Math.floor((40 / allFilesToUpload.length) * i));
                    }

                    // Construct galleryUrls:
                    // Scene 2 and Scene 3 are the first two elements of the gallery.
                    if (scene2Url || scene3Url || newGalleryAssets.length > 0) {
                        const compiledGallery = [];
                        // keep existing gallery unless we are overwriting specific slots?
                        // The simplest approach is to push the new ones.
                        // For AI video, the script generator pulls galleryUrls[0] and galleryUrls[1].
                        if (scene2Url) compiledGallery.push(scene2Url);
                        else if (isEditing && galleryUrls[0]) compiledGallery.push(galleryUrls[0]);

                        if (scene3Url) compiledGallery.push(scene3Url);
                        else if (isEditing && galleryUrls[1]) compiledGallery.push(galleryUrls[1]);

                        // Append the rest of existing that aren't the first two
                        if (isEditing && galleryUrls.length > 2) {
                            compiledGallery.push(...galleryUrls.slice(2));
                        }

                        compiledGallery.push(...newGalleryAssets);
                        galleryUrls = compiledGallery;
                    }
                }
            } catch (err) {
                console.error("Storage upload error:", err);
                alert(`Failed to upload images.`);
                setIsUploading(false);
                return;
            }
            setUploadProgress(70);

            setUploadProgress(90);

            // 2. Prepare the Car Record payload
            const carPayload = {
                make: formData.get("make"),
                model: formData.get("model"),
                year: parseInt(formData.get("year")),
                price: parseFloat(formData.get("price")),
                mileage: parseInt(formData.get("mileage")),
                transmission: formData.get("transmission"),
                fuel_type: formData.get("fuel_type"),
                status: formData.get("status"),
                main_image_url: mainImageUrl,
                gallery_urls: galleryUrls,
                video_url: formData.get("video_url") || (isEditing ? initialData.video_url : null),
                description: formData.get("description") || null,
                features: formData.getAll("features"),
                is_featured: formData.get("is_featured") === "on",
            };

            // AI Optimization
            setUploadProgress(92);
            carPayload.description = await optimizeDescriptionAction(carPayload, carPayload.description);

            // 3. Insert or Update
            let savedCarId = isEditing ? initialData.id : null;
            if (isEditing) {
                const { error: dbError } = await supabase
                    .from('cars')
                    .update(carPayload)
                    .eq('id', initialData.id);
                if (dbError) throw dbError;
            } else {
                // For new vehicles, we select the inserted data back so we have the new ID
                const { data: insertedData, error: dbError } = await supabase
                    .from('cars')
                    .insert([carPayload])
                    .select()
                    .single();
                if (dbError) throw dbError;
                savedCarId = insertedData.id;

                // Step 4: Autonomous AI Video Generation!
                // If they didn't provide a manual YouTube link, we queue it
                if (!carPayload.video_url) {
                    setUploadProgress(95);
                    await queueAiWalkaround(insertedData.id);
                }
            }

            // Best-effort IndexNow ping — never block the save UX
            if (savedCarId) {
                pingVehicleUrls([savedCarId]).catch((err) => console.warn("IndexNow ping failed:", err));
                // Auto-generate SEO metadata + image alts in the background.
                // Fire-and-forget; admin doesn't wait for Gemini.
                autoFixSeoForCar(savedCarId).catch((err) => console.warn("Auto SEO failed:", err));
            }

            setUploadProgress(100);
            router.push("/admin/inventory");

        } catch (err) {
            console.error(err);
            alert("An error occurred while saving the vehicle.");
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Make</label>
                    <input type="text" name="make" defaultValue={initialData?.make} placeholder="e.g. Toyota" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Model</label>
                    <input type="text" name="model" defaultValue={initialData?.model} placeholder="e.g. Fortuner 2.8 GD-6" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Year</label>
                    <input type="number" name="year" defaultValue={initialData?.year} placeholder="2023" required min="1990" max="2025" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Price (ZAR)</label>
                    <input type="number" name="price" defaultValue={initialData?.price} placeholder="799900" required min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mileage (km)</label>
                    <input type="number" name="mileage" defaultValue={initialData?.mileage} placeholder="45000" required min="0" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Transmission</label>
                    <select name="transmission" defaultValue={initialData?.transmission || "Automatic"} required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Fuel Type</label>
                    <select name="fuel_type" defaultValue={initialData?.fuel_type || "Diesel"} required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    <select name="status" defaultValue={initialData?.status || "available"} required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Featured Vehicle</label>
                    <label className="flex items-center gap-3 cursor-pointer group mt-4">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                name="is_featured"
                                defaultChecked={initialData?.is_featured || false}
                                className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded cursor-pointer checked:bg-amber-500 checked:border-amber-500 transition-colors"
                            />
                            <span className="material-symbols-outlined absolute text-white text-[18px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">star</span>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Show on Home Page</span>
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4 pb-4">
                <h3 className="block text-sm font-bold text-slate-700 mb-4">Vehicle Features & Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {Object.entries(CAR_FEATURES).map(([category, features]) => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{category}</h4>
                            <div className="space-y-2">
                                {features.map((feature) => (
                                    <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                name="features"
                                                value={feature}
                                                defaultChecked={hasFeature(feature)}
                                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded cursor-pointer checked:bg-primary checked:border-primary transition-colors"
                                            />
                                            <span className="material-symbols-outlined absolute text-white text-[16px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{feature}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-6">

                {isEditing && initialData?.main_image_url && (
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Current Main Image</label>
                        <div className="relative h-48 w-64 rounded-xl overflow-hidden border border-slate-200">
                            <Image src={initialData.main_image_url} alt="Current vehicle" fill className="object-cover" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Uploading a new file below will overwrite this image.</p>
                    </div>
                )}

                {/* File Upload Section */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-4">Video Cinematic Scenes {"&"} Photos</label>
                    <p className="text-sm text-slate-500 mb-6">These first three images are used by the AI engine to generate the 3 distinct video scenes. The rest form the image gallery.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Scene 1 */}
                        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                            <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">directions_car</span>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Scene 1: Front / Side</label>
                            <p className="text-xs text-slate-500 mb-4">Hero exterior shot.</p>
                            <input
                                type="file"
                                name="scene1_image"
                                accept="image/png, image/jpeg, image/webp"
                                className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 block"
                            />
                        </div>

                        {/* Scene 2 */}
                        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                            <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">dashboard</span>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Scene 2: Dashboard View</label>
                            <p className="text-xs text-slate-500 mb-4">Interior cockpit layout.</p>
                            <input
                                type="file"
                                name="scene2_image"
                                accept="image/png, image/jpeg, image/webp"
                                className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 block"
                            />
                        </div>

                        {/* Scene 3 */}
                        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                            <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">airline_seat_recline_extra</span>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Scene 3: Backseat Area</label>
                            <p className="text-xs text-slate-500 mb-4">Passenger comfort / space.</p>
                            <input
                                type="file"
                                name="scene3_image"
                                accept="image/png, image/jpeg, image/webp"
                                className="text-xs text-slate-500 w-full file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 block"
                            />
                        </div>
                    </div>

                    {/* Bulk Gallery */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">collections</span>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Gallery Images</label>
                        <p className="text-xs text-slate-500 mb-4">Hold Ctrl/Cmd to select multiple extra photos (engines, boot space, specific angles).</p>
                        <input
                            type="file"
                            name="gallery_images"
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mx-auto block"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Extra or unique feature</label>
                    <textarea name="description" defaultValue={initialData?.description} rows="5" placeholder="List key specific features and condition..." className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                </div>
            </div>

            <div className="pt-6 relative">
                <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white font-bold py-4 rounded-lg shadow-md transition-all text-lg flex items-center justify-center gap-2 relative overflow-hidden"
                >
                    {/* Progress Bar Background */}
                    {isUploading && (
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    )}

                    <span className="material-symbols-outlined relative z-10">
                        {isUploading ? 'sync' : 'save'}
                    </span>
                    <span className="relative z-10">
                        {isUploading ? (uploadProgress >= 90 ? 'AI is working...' : `Uploading Photo... ${uploadProgress}%`) : (isEditing ? 'Save Changes' : 'Publish Vehicle to Showroom')}
                    </span>
                </button>
            </div>
        </form>
    );
}
