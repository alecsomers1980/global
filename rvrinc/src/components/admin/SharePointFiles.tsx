"use client";

import { useState } from "react";
import { ExternalLink, FileText, FolderOpen, Search, X } from "lucide-react";
// ExternalLink still used for individual file links below

interface SharePointFile {
    name: string;
    webUrl: string;
    size: number;
    lastModified: string;
    mimeType: string;
}

interface Props {
    files: SharePointFile[];
    folderUrl: string;
    error?: string;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SharePointFiles({ files, folderUrl, error }: Props) {
    const [search, setSearch] = useState("");

    const filtered = search.trim()
        ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
        : files;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-brand-gold" /> Case Files
                    {files.length > 0 && (
                        <span className="text-sm font-normal text-gray-500">
                            ({search.trim() ? `${filtered.length}/${files.length}` : files.length})
                        </span>
                    )}
                </h2>
            </div>

            {files.length > 0 && (
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search files..."
                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-2.5">
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>
            )}

            {error && !files.length && (
                <p className="text-sm text-gray-500 py-4 text-center">
                    {error === "No folder found for this case."
                        ? "No SharePoint folder exists for this case yet."
                        : `Unable to load files: ${error}`}
                </p>
            )}

            {files.length > 0 && filtered.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">
                    No files match &ldquo;{search}&rdquo;.
                </p>
            )}

            {filtered.length > 0 && (
                <div className="space-y-2">
                    {filtered.map((file) => (
                        <a
                            key={file.name}
                            href={file.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <FileText className="w-4 h-4 text-brand-navy flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-gold transition-colors">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatSize(file.size)}
                                        {file.lastModified && ` • ${new Date(file.lastModified).toLocaleDateString("en-ZA")}`}
                                    </p>
                                </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-gold flex-shrink-0 ml-2 transition-colors" />
                        </a>
                    ))}
                </div>
            )}

            {!error && files.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">
                    No files in SharePoint for this case.
                </p>
            )}
        </div>
    );
}
