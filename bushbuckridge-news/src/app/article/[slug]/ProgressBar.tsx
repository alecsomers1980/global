"use client";

import { useEffect, useState } from "react";

export default function ProgressBar() {
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        const updateReadingProgress = () => {
            const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const currentScroll = window.scrollY;
            if (scrollTotal > 0) {
                setReadingProgress((currentScroll / scrollTotal) * 100);
            }
        };

        window.addEventListener("scroll", updateReadingProgress);
        return () => window.removeEventListener("scroll", updateReadingProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-zinc-100">
            <div
                className="h-full bg-[#E60000] transition-all duration-150 ease-out"
                style={{ width: `${readingProgress}%` }}
            />
        </div>
    );
}
