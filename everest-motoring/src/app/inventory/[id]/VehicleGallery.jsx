"use client";

import { useState } from "react";
import Image from "next/image";
import MuxPlayer from "@mux/mux-player-react";

export default function VehicleGallery({ car }) {
    const allImages = [];
    if (car.main_image_url) allImages.push(car.main_image_url);
    if (car.gallery_urls && car.gallery_urls.length > 0) {
        allImages.push(...car.gallery_urls);
    }

    const hasValidVideo = car.video_url && !car.video_url.startsWith('heygen_pending:') && car.video_url !== 'ai_processing';

    // Start with video if available, otherwise the first image
    const [activeMedia, setActiveMedia] = useState(hasValidVideo ? 'video' : (allImages.length > 0 ? 0 : null));

    return (
        <div>
            {/* Top Gallery / Main Video Hero */}
            <div className="relative h-[400px] md:h-[600px] bg-slate-900 overflow-hidden">
                {activeMedia === 'video' ? (
                    car.video_url.startsWith('mux:') ? (
                        <MuxPlayer
                            streamType="on-demand"
                            playbackId={car.video_url.split(':')[1]}
                            metadata={{
                                video_id: car.video_url.split(':')[1],
                                video_title: `${car.year} ${car.make} ${car.model} AI Walkaround`
                            }}
                            autoPlay="muted"
                            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <video
                            src={car.video_url}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            controls
                        />
                    )
                ) : activeMedia !== null && allImages[activeMedia] ? (
                    <Image
                        src={allImages[activeMedia]}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        fill
                        priority
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-700">
                        <span className="material-symbols-outlined text-6xl">directions_car</span>
                    </div>
                )}
            </div>

            {/* Secondary Image Gallery */}
            {((allImages.length > 0) || hasValidVideo) && (
                <div className="flex overflow-x-auto gap-4 p-4 md:p-6 bg-slate-50 border-b border-slate-100 snap-x">

                    {/* Add Video Option to Gallery if it exists */}
                    {hasValidVideo && (
                        <div
                            onClick={() => setActiveMedia('video')}
                            className={`relative w-32 h-20 md:w-40 md:h-28 flex-shrink-0 snap-start rounded-lg overflow-hidden border-2 shadow-sm cursor-pointer transition-all ${activeMedia === 'video' ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-slate-200 hover:border-primary/50'}`}
                        >
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center flex-col gap-2 group">
                                <span className="material-symbols-outlined text-3xl md:text-4xl text-white group-hover:scale-110 transition-transform">play_circle</span>
                                <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">Play Video</span>
                            </div>
                        </div>
                    )}

                    {/* Image Thumbnails */}
                    {allImages.map((url, idx) => (
                        <div
                            key={idx}
                            onClick={() => setActiveMedia(idx)}
                            className={`relative w-32 h-20 md:w-40 md:h-28 flex-shrink-0 snap-start rounded-lg overflow-hidden border-2 shadow-sm cursor-pointer transition-all ${activeMedia === idx ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-slate-200 hover:border-primary/50 hover:scale-105'}`}
                        >
                            <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
