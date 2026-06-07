"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface Props {
    initialSearch: string;
    phaseFilter: string;
    branchFilter: string;
}

export default function CaseSearch({ initialSearch, phaseFilter, branchFilter }: Props) {
    const [value, setValue] = useState(initialSearch);
    const router = useRouter();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Sync if parent changes
    useEffect(() => {
        setValue(initialSearch);
    }, [initialSearch]);

    const updateUrl = useCallback(
        (search: string) => {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (phaseFilter) params.set("phase", phaseFilter);
            if (branchFilter) params.set("branch", branchFilter);
            const qs = params.toString();
            router.replace(`/admin/cases${qs ? `?${qs}` : ""}`, { scroll: false });
        },
        [router, phaseFilter, branchFilter]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => updateUrl(v), 250);
    };

    const handleClear = () => {
        setValue("");
        updateUrl("");
    };

    return (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="Search by case number, client name, ID number, RAF ref..."
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                autoFocus={!!initialSearch}
            />
            {value && (
                <button onClick={handleClear} className="absolute right-3 top-2.5">
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
            )}
        </div>
    );
}
