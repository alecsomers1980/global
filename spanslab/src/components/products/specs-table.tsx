"use client";

interface Spec {
    label: string;
    value: string;
}

interface TechnicalSpecsTableProps {
    specs: Spec[];
    title?: string;
}

export function TechnicalSpecsTable({ specs, title = "Technical Specifications" }: TechnicalSpecsTableProps) {
    return (
        <div className="mb-10 lg:mb-0">
            <h3 className="text-xl font-bold text-slate-DEFAULT mb-6 border-b-2 border-orange-DEFAULT inline-block pb-1">
                {title}
            </h3>
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <table className="min-w-full divide-y divide-border/50">
                    <tbody className="divide-y divide-border/50 bg-white">
                        {specs.map((spec, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-slate-50/50" : "bg-white"}>
                                <td className="py-4 pl-6 pr-3 text-sm font-semibold text-slate-900 w-1/2">
                                    {spec.label}
                                </td>
                                <td className="px-3 py-4 text-sm text-slate-600">
                                    {spec.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 italic">
                * Specifications may vary slightly. Contact technical support for precise engineering data.
            </p>
        </div>
    );
}
