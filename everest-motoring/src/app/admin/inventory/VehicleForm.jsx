"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { queueAiWalkaround, optimizeDescriptionAction } from "./ai_actions";

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
            const imageFiles = formData.getAll("image_files");
            let mainImageUrl = formData.get("main_image_url") || (isEditing ? initialData.main_image_url : null);
            let galleryUrls = isEditing && initialData.gallery_urls ? [...initialData.gallery_urls] : [];

            // 1. Upload to Supabase Storage if new files were selected
            const validFiles = imageFiles.filter(file => file.size > 0);
            if (validFiles.length > 0) {
                setUploadProgress(30);

                let i = 0;
                for (const imageFile of validFiles) {
                    const fileExt = imageFile.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `vehicles/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('vehicles')
                        .upload(filePath, imageFile);

                    if (uploadError) {
                        console.error("Storage upload error:", uploadError);
                        alert(`Failed to upload ${imageFile.name}.`);
                        setIsUploading(false);
                        return;
                    }

                    const { data: publicUrlData } = supabase.storage
                        .from('vehicles')
                        .getPublicUrl(filePath);

                    if (i === 0) {
                        mainImageUrl = publicUrlData.publicUrl;
                    } else {
                        galleryUrls.push(publicUrlData.publicUrl);
                    }
                    i++;
                    setUploadProgress(30 + Math.floor((40 / validFiles.length) * i));
                }
                setUploadProgress(70);
            }

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
                video_url: formData.get("video_url") || null,
                description: formData.get("description") || null,
                features: formData.getAll("features"),
            };

            // AI Optimization
            setUploadProgress(92);
            carPayload.description = await optimizeDescriptionAction(carPayload, carPayload.description);

            // 3. Insert or Update
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

                // Step 4: Autonomous AI Video Generation!
                // If they didn't provide a manual YouTube link, we queue it
                if (!carPayload.video_url) {
                    setUploadProgress(95);
                    await queueAiWalkaround(insertedData.id);
                }
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
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">add_photo_alternate</span>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{isEditing ? "Upload New Images" : "Upload Vehicle Images"}</label>
                    <p className="text-xs text-slate-500 mb-4">Upload as many photos as you like! Hold Ctrl/Cmd to select multiple. <br />The first image will be the primary exterior hero, the second an interior shot, and the third another exterior angle. The AI Engine will automatically use the first three to generate the video commercial.</p>
                    <input
                        type="file"
                        name="image_files"
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mx-auto block"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">OR USE EXTERNAL LINK</span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Main Image URL</label>
                    <input type="url" name="main_image_url" defaultValue={initialData?.main_image_url} placeholder="https://..." className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">YouTube Video URL (Optional Demo Walkaround)</label>
                    <input type="url" name="video_url" defaultValue={initialData?.video_url} placeholder="https://www.youtube.com/..." className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Description</label>
                    <textarea name="description" defaultValue={initialData?.description} rows="5" placeholder="List key features, 100-point check notes, and condition..." className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
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
