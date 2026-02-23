"use client";

import { useState, useCallback } from "react";

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
}

let toastListeners: ((toast: Toast) => void)[] = [];
let dismissListeners: ((id: string) => void)[] = [];

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).slice(2);

        // Simple alert fallback for now
        if (variant === "destructive") {
            alert(`Error: ${title}\n${description || ""}`);
        } else {
            alert(`${title}\n${description || ""}`);
        }

        return { id };
    }, []);

    return { toast, toasts };
}
