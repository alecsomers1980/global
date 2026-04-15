"use client";

import { useState } from "react";
import { createSocialPost } from "./socialAction";

export default function SocialPostButton({ car }) {
    const [status, setStatus] = useState("idle"); // idle, loading, success, error

    const handlePost = async () => {
        // Prevent accidental double clicks
        if (status === "loading" || status === "success") return;
        
        setStatus("loading");
        const result = await createSocialPost(car);
        if (result.success) {
            setStatus("success");
            setTimeout(() => setStatus("idle"), 3000); 
        } else {
            setStatus("error");
            alert("Failed to post: " + result.error);
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <button 
            onClick={handlePost}
            disabled={status === "loading" || status === "success"}
            className={`text-slate-400 hover:text-blue-500 transition-colors p-2 flex items-center gap-1 ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''} ${status === 'success' ? 'text-green-500 hover:text-green-500' : ''}`}
            title="Post to social"
        >
            <span className="material-symbols-outlined">
                {status === "loading" ? "hourglass_empty" : status === "success" ? "check_circle" : "share"}
            </span>
        </button>
    );
}
