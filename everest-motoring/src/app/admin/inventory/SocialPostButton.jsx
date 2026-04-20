"use client";

import { useState } from "react";
import { createSocialPost } from "./socialAction";

function formatSharedDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export default function SocialPostButton({ car }) {
    const alreadyShared = Boolean(car.social_shared_at);
    const [status, setStatus] = useState(alreadyShared ? "shared" : "idle");
    // idle | loading | success | error | shared

    const handlePost = async () => {
        if (status === "loading") return;

        // If already shared, confirm re-share
        if (status === "shared" || status === "success") {
            const ok = confirm(
                `This vehicle was already shared${car.social_shared_at ? ` on ${formatSharedDate(car.social_shared_at)}` : ""}. Share again?`
            );
            if (!ok) return;
        }

        setStatus("loading");
        const result = await createSocialPost(car);
        if (result.success) {
            setStatus("success");
            setTimeout(() => setStatus("shared"), 4000);
        } else {
            setStatus("error");
            alert("Failed to post: " + result.error);
            setTimeout(() => setStatus(alreadyShared ? "shared" : "idle"), 4000);
        }
    };

    const isShared = status === "shared" || status === "success";
    const icon =
        status === "loading" ? "hourglass_empty" :
        status === "success" ? "check_circle" :
        status === "shared" ? "share" :
        "share";
    const title =
        status === "loading" ? "Posting..." :
        status === "success" ? "Posted!" :
        status === "shared" ? `Shared${car.social_shared_at ? ` on ${formatSharedDate(car.social_shared_at)}` : ""} — click to re-share` :
        "Post to social";

    return (
        <button
            onClick={handlePost}
            disabled={status === "loading"}
            className={`transition-colors p-2 flex items-center gap-1 ${
                status === "loading" ? "opacity-50 cursor-not-allowed text-slate-400" :
                isShared ? "text-green-600 hover:text-green-700" :
                "text-slate-400 hover:text-blue-500"
            }`}
            title={title}
        >
            <span className="material-symbols-outlined">{icon}</span>
        </button>
    );
}
