"use client";

import { useState, useTransition } from "react";

export default function DeleteVehicleButton({ car, deleteCarAction }) {
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState(null);

    function handleClick() {
        const label = `${car.year} ${car.make} ${car.model}`;
        if (!window.confirm(`Permanently delete ${label}? This cannot be undone.`)) return;

        setErrorMsg(null);
        startTransition(async () => {
            const result = await deleteCarAction(car.id);
            if (!result?.success) {
                const message = result?.error || "Delete failed for an unknown reason.";
                setErrorMsg(message);
                window.alert(`Could not delete ${label}.\n\n${message}\n\nThis is usually because the vehicle still has linked records (sales, leads, test-drive requests, or trade-in offers). Tell Claude the error code above and it will fix the constraint.`);
            }
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={isPending}
                className="text-slate-400 hover:text-red-500 transition-colors p-2 disabled:opacity-50 disabled:cursor-wait"
                title={isPending ? "Deleting..." : "Delete Vehicle"}
            >
                <span className="material-symbols-outlined">{isPending ? "hourglass_empty" : "delete"}</span>
            </button>
            {errorMsg && (
                <span className="hidden" data-delete-error={errorMsg} />
            )}
        </>
    );
}
