'use client';
import { useState, useEffect, useCallback, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { createClientSupabase } from '@/lib/supabase';
import { getHpLatexMaterials, getArtworkRate, computeArtworkCharge, computeHpLatexCharge, getHpLatexRows, getHpLatexRowRate, getVinylCutMaterials, getVinylCutRowRate, computeVinylCutCharge, computeInstallCharge, getInstallBreakdown, syncAutoLines } from '@/lib/jobcard-charges';
const FLATBED_MATERIALS = ['Correx 3.0', 'Correx 3.5', 'Correx 4.0', 'Correx 5.0', '3mm FOAM', '5mm FOAM', '10mm FOAM', '15mm FOAM', '20mm FOAM', '3mm ACM', '0.6 CHROMADEK', '3mm PERSPEX', 'WOOD', 'GLASS', 'OTHER'];
const STATUSES = ['Quoted', 'Approved', 'In Production', 'On Hold', 'Completed'];

interface FileEntry { id: string; file: File | null; name: string; description: string; }
function createEntry(): FileEntry { return { id: Math.random().toString(36).slice(2), file: null, name: '', description: '' }; }

const calculateWorkflowStatus = (workflow: any) => {
    if (!workflow) return 'Quoted';
    
    if (workflow.completed?.ticked) return 'Completed';
    if (workflow.ready_collection?.ticked) return 'Ready';
    
    const top5 = ['captured', 'quote_sent', 'deposit_paid', 'proof_sent', 'approved'];
    const allTop5Ticked = top5.every(k => workflow[k]?.ticked);
    if (allTop5Ticked) return 'In-Production';
    
    if (workflow.approved?.ticked) return 'Approved';
    if (workflow.proof_sent?.ticked) return 'Proof Sent';
    if (workflow.deposit_paid?.ticked) return 'Deposit Paid / PO';
    if (workflow.quote_sent?.ticked) return 'Quote Sent';
    if (workflow.captured?.ticked) return 'Captured';
    return 'Quoted';
};

const JOBCARD_ITEM_OPTIONS = [
    { label: 'ABS', description: 'Single Sided Print' },
    { label: 'ACM', description: 'Single Sided Print' },
    { label: 'APPLICATION', description: 'on site / other' },
    { label: 'ARTWORK / LAYOUT', description: 'R 400/30min - We get a lot done in 30min' },
    { label: 'BILLBOARD', description: 'Site description here' },
    { label: 'BRUSHED ALUMINIUM', description: 'Printed Single or Double Sided' },
    { label: 'CANVAS', description: 'Boxed' },
    { label: 'CHROMADEK', description: 'Single Sided Print' },
    { label: 'CONTRAVISION / ONE WAY VINYL', description: 'Film with small holes' },
    { label: 'CORREX', description: 'Full Colour' },
    { label: 'COURIER', description: 'Package & Deliver' },
    { label: 'ENGINEERING', description: 'includes steelwork etc.' },
    { label: 'FLEX', description: 'FLEX' },
    { label: 'FOAMBOARD', description: 'enter thickness' },
    { label: 'INSTALLATION', description: 'add physical address here' },
    { label: 'LAMINATE', description: 'Lamination' },
    { label: 'MAGNETS', description: 'Vehicle grade' },
    { label: 'MISCELLANEOUS', description: 'Fisher plugs' },
    { label: 'NAMEBADGES', description: 'Includes Magnetic Fastener' },
    { label: 'NOTE', description: 'NOTE' },
    { label: 'PERSPEX', description: 'Single Sided Print' },
    { label: 'PROMO ITEM', description: 'includes pull ups gazebos etc' },
    { label: 'PVC', description: 'Banner' },
    { label: 'ROWMARK', description: 'Engraved Traffolite' },
    { label: 'RUSH FEE', description: "Because it's worth it" },
    { label: 'SCREENPRINT', description: 'size and material' },
    { label: 'SETUP CHARGE', description: 'Applies to each execution' },
    { label: 'SIGNMAKING MATERIALS', description: 'SIGNMAKING MATERIALS' },
    { label: 'STATIONERY', description: 'All paper stationery' },
    { label: 'STICKERS', description: 'Full Colour' },
    { label: 'TRAVEL + VEHICLE', description: 'To get the A Team on Site' },
    { label: 'UV PRINT', description: 'Direct UV Print' },
    { label: 'VEHICLE', description: 'Vehicle branding / wrap' },
    { label: 'WALLPAPER', description: 'Full Colour' },
];

const StatusCheckbox = ({ label, name, jobcard, setJobcard }: { label: string; name: string; jobcard: any; setJobcard: any }) => {
    const workflow = jobcard.status_workflow_json || {};
    const item = workflow[name] || { ticked: false };
    const dateTicked = item.ticked_at ? new Date(item.ticked_at) : null;
    const canUntick = !dateTicked || (Date.now() - dateTicked.getTime() < 24 * 60 * 60 * 1000);

    const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (!checked && !canUntick) {
            alert("Cannot untick a status item more than a day later.");
            return;
        }
        
        const updatedWorkflow = {
            ...workflow,
            [name]: {
                ticked: checked,
                ticked_at: checked ? new Date().toISOString() : null
            }
        };

        const newStatus = calculateWorkflowStatus(updatedWorkflow);
        setJobcard((prev: any) => ({
            ...prev,
            status_workflow_json: updatedWorkflow,
            status: newStatus
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDateValue = e.target.value; // YYYY-MM-DD
        const newDateISO = new Date(newDateValue + 'T00:00:00').toISOString();
        const updatedWorkflow = {
            ...workflow,
            [name]: {
                ticked: true,
                ticked_at: newDateISO
            }
        };
        const newStatus = calculateWorkflowStatus(updatedWorkflow);
        setJobcard((prev: any) => ({
            ...prev,
            status_workflow_json: updatedWorkflow,
            status: newStatus
        }));
    };

    return (
        <div className="flex flex-col items-center gap-1 justify-center min-w-[100px] border-r border-gray-300 last:border-r-0 px-3 py-1">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={!!item.ticked}
                    onChange={handleCheck}
                    disabled={name === 'captured'}
                    className="w-4 h-4 text-aloe-green/80 rounded border-gray-300 cursor-pointer"
                />
                <span className="font-bold text-[11px] text-gray-700 text-center">{label}</span>
            </label>
            {item.ticked && dateTicked && (
                <input
                    type="date"
                    value={dateTicked.toISOString().slice(0, 10)}
                    onChange={handleDateChange}
                    className="text-[9px] text-gray-500 border border-gray-200 rounded px-1 py-0.5 w-full focus:outline-none"
                />
            )}
        </div>
    );
};

const InputLine = ({ label, name, jobcard, handleChange }: { label: string; name: string; jobcard: any; handleChange: any }) => (
    <div className="flex border-b border-gray-300">
        <span className="w-24 uppercase text-[10px] text-gray-500 font-bold py-2 px-2 border-r border-gray-300 flex items-center bg-gray-50">{label}</span>
        <input type="text" name={name} value={jobcard[name] || ''} onChange={handleChange} className="flex-1 py-1 px-3 text-sm focus:outline-none focus:bg-blue-50 bg-white font-medium text-gray-800" />
    </div>
);

const Toggle = ({ label, name, jobcard, handleChange }: { label: string; name: string; jobcard: any; handleChange: any }) => (
    <label className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <input type="checkbox" name={name} checked={!!jobcard[name]} onChange={handleChange} className="w-4 h-4 text-aloe-green/80 rounded border-gray-300 focus:ring-aloe-green cursor-pointer" />
    </label>
);

const DeptRow = ({ label, name, deptKey, jobcard, handleChange, setJobcard, me }: { label: string; name: string; deptKey: string; jobcard: any; handleChange: any; setJobcard: any; me: string | null }) => {
    const completion = jobcard.department_completion_json?.[deptKey] || { completed: false, completed_at: null, completed_by: null };

    const handleCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setJobcard((prev: any) => ({
            ...prev,
            department_completion_json: {
                ...(prev.department_completion_json || {}),
                [deptKey]: {
                    ...completion,
                    completed: checked,
                    completed_at: checked ? (completion.completed_at || new Date().toISOString()) : completion.completed_at,
                    completed_by: checked ? (completion.completed_by || me) : completion.completed_by,
                },
            },
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setJobcard((prev: any) => ({
            ...prev,
            department_completion_json: {
                ...(prev.department_completion_json || {}),
                [deptKey]: {
                    ...completion,
                    completed: true,
                    completed_at: newDate ? new Date(newDate).toISOString() : completion.completed_at,
                    completed_by: completion.completed_by || me,
                },
            },
        }));
    };

    return (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gray-200 hover:bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <input type="checkbox" name={name} checked={!!jobcard[name]} onChange={handleChange} className="w-4 h-4 text-aloe-green/80 rounded border-gray-300 focus:ring-aloe-green cursor-pointer" />
                <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Completed</span>
                <input
                    type="checkbox"
                    className="w-4 h-4 text-aloe-green/80 rounded border-gray-300 cursor-pointer"
                    checked={!!completion.completed}
                    onChange={handleCheckedChange}
                />
                {completion.completed && (
                    <>
                        {completion.completed_by && (
                            <span className="text-[10px] font-bold text-[#5f8c0b] bg-[#84cc16]/10 border border-[#84cc16]/30 px-1.5 py-0.5 rounded">
                                ✓ {completion.completed_by}
                            </span>
                        )}
                        <input
                            type="date"
                            className="text-[10px] text-gray-600 border border-gray-200 rounded px-1 py-0.5 focus:outline-none"
                            value={completion.completed_at ? completion.completed_at.slice(0, 10) : ''}
                            onChange={handleDateChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default function JobcardEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    
    const [jobcard, setJobcard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [lightboxPath, setLightboxPath] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadEntries, setUploadEntries] = useState<FileEntry[]>([createEntry()]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [uploadingScan, setUploadingScan] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const [companySuggestions, setCompanySuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [me, setMe] = useState<string | null>(null);

    useEffect(() => {
        createClientSupabase().auth.getUser().then(({ data }) => {
            setMe((data.user?.app_metadata as any)?.short_code ?? null);
        });
    }, []);

    const loadJobcard = useCallback(async () => {
        try {
            const res = await fetch(`/api/portal/admin/jobcards/${id}`);
            const data = await res.json();
            if (data.jobcard) setJobcard(data.jobcard);
            else router.push('/portal/admin/jobcards');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        loadJobcard();
    }, [loadJobcard]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setJobcard((prev: any) => ({ ...prev, [name]: checked }));
        } else if (name === 'sub_total') {
            const newSubtotal = parseFloat(value) || 0;
            const newVat = newSubtotal * 0.15;
            const newTotal = newSubtotal + newVat;
            setJobcard((prev: any) => ({ 
                ...prev, 
                sub_total: value,
                vat_total: newVat.toFixed(2),
                total: newTotal.toFixed(2)
            }));
        } else {
            setJobcard((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleCompanyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setJobcard((prev: any) => ({ ...prev, company: value }));

        if (value.trim().length > 1) {
            const supabase = createClientSupabase();
            const { data } = await supabase.from('customers')
                .select('customer, contact, mobile_1, mobile_2, email')
                .ilike('customer', `%${value}%`)
                .order('customer')
                .limit(8);
            setCompanySuggestions(data || []);
            setShowSuggestions(true);
        } else {
            setCompanySuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectCompany = (item: any) => {
        setJobcard((prev: any) => ({
            ...prev,
            company: item.customer,
            contact_name: item.contact || prev.contact_name,
            contact_phone: item.mobile_1 || prev.contact_phone,
            contact_phone_2: item.mobile_2 || prev.contact_phone_2,
            email: item.email || prev.email,
        }));
        setShowSuggestions(false);
    };

    const handleScannedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingScan(true);
        const supabase = createClientSupabase();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `jobcards/${id}/scanned_${Date.now()}_${safeName}`;
        
        const { error: err } = await supabase.storage.from('client-uploads').upload(path, file);
        if (err) { alert('Upload failed: ' + err.message); setUploadingScan(false); return; }
        
        setJobcard((prev: any) => ({ ...prev, scanned_jobcard_path: path }));
        setUploadingScan(false);
    };

    const handleEngChange = (name: string, value: any) => {
        setJobcard((prev: any) => ({
            ...prev,
            engineer_details_json: {
                ...(prev.engineer_details_json || {}),
                [name]: value
            }
        }));
    };

    const handleArtworkChange = (name: string, value: any) => {
        setJobcard((prev: any) => ({
            ...prev,
            artwork_details_json: {
                ...(prev.artwork_details_json || {}),
                [name]: value
            }
        }));
    };

    const [settings, setSettings] = useState<any>(null);
    useEffect(() => {
        fetch('/api/settings')
            .then(r => r.ok ? r.json() : { pricing: null })
            .then(d => setSettings(d.pricing))
            .catch(() => {});
    }, []);
    useEffect(() => {
        if (!jobcard) return;
        const synced = syncAutoLines(jobcard, settings);
        const sameItems = JSON.stringify(synced.items_json) === JSON.stringify(jobcard.items_json || []);
        const sameTotal = String(synced.total) === String(jobcard.total ?? '');
        if (!sameItems || !sameTotal) {
            setJobcard((prev: any) => ({ ...prev, ...synced }));
        }
    }, [jobcard, settings]);
    const handleArtworkMilestone = (key: string, patch: any) => {
        setJobcard((prev: any) => ({
            ...prev,
            artwork_details_json: {
                ...(prev.artwork_details_json || {}),
                milestones: {
                    ...(prev.artwork_details_json?.milestones || {}),
                    [key]: {
                        ...(prev.artwork_details_json?.milestones?.[key] || {}),
                        ...patch,
                    },
                },
            },
        }));
    };

    const handleFlatbedChange = (name: string, value: any) => {
        setJobcard((prev: any) => ({
            ...prev,
            flatbed_details_json: {
                ...(prev.flatbed_details_json || {}),
                [name]: value
            }
        }));
    };

    const handleScreenChange = (name: string, value: any) => {
        setJobcard((prev: any) => ({
            ...prev,
            screen_details_json: {
                ...(prev.screen_details_json || {}),
                [name]: value
            }
        }));
    };

    const handleDigitalChange = (name: string, value: any) => {
        setJobcard((prev: any) => ({
            ...prev,
            digital_details_json: {
                ...(prev.digital_details_json || {}),
                [name]: value
            }
        }));
    };

    const handleAddHpLatexRow = () => {
        setJobcard((prev: any) => {
            const rows = Array.isArray(prev.digital_details_json?.rows) ? prev.digital_details_json.rows : [];
            return { ...prev, digital_details_json: { ...(prev.digital_details_json || {}), rows: [...rows, { material: '', meters: '' }] } };
        });
    };

    const handleHpLatexRowChange = (index: number, field: string, value: string) => {
        setJobcard((prev: any) => {
            const rows = Array.isArray(prev.digital_details_json?.rows) ? [...prev.digital_details_json.rows] : [];
            if (!rows[index]) rows[index] = { material: '', meters: '' };
            rows[index] = { ...rows[index], [field]: value };
            return { ...prev, digital_details_json: { ...(prev.digital_details_json || {}), rows } };
        });
    };

    const handleRemoveHpLatexRow = (index: number) => {
        setJobcard((prev: any) => {
            const rows = Array.isArray(prev.digital_details_json?.rows) ? prev.digital_details_json.rows.filter((_: any, i: number) => i !== index) : [];
            return { ...prev, digital_details_json: { ...(prev.digital_details_json || {}), rows } };
        });
    };

    const handleToolToggle = (key: string) => {
        setJobcard((prev: any) => ({
            ...prev,
            install_tools_json: { ...(prev.install_tools_json || {}), [key]: !prev.install_tools_json?.[key] },
        }));
    };

    const handleAddOutsourceRow = () => {
        setJobcard((prev: any) => ({
            ...prev,
            outsource_details_json: [...(Array.isArray(prev.outsource_details_json) ? prev.outsource_details_json : []), { company: '', date_sent: '', return_date: '' }],
        }));
    };

    const handleOutsourceRowChange = (index: number, field: string, value: string) => {
        setJobcard((prev: any) => {
            const rows = Array.isArray(prev.outsource_details_json) ? [...prev.outsource_details_json] : [];
            if (!rows[index]) rows[index] = { company: '', date_sent: '', return_date: '' };
            rows[index] = { ...rows[index], [field]: value };
            return { ...prev, outsource_details_json: rows };
        });
    };

    const handleRemoveOutsourceRow = (index: number) => {
        setJobcard((prev: any) => ({
            ...prev,
            outsource_details_json: Array.isArray(prev.outsource_details_json) ? prev.outsource_details_json.filter((_: any, i: number) => i !== index) : [],
        }));
    };

    const handleApplicateChange = (name: string, value: any) => {
        setJobcard((prev: any) => ({
            ...prev,
            applicate_details_json: {
                ...(prev.applicate_details_json || {}),
                [name]: value
            }
        }));
    };

    const handleAddVinylRow = () => {
        setJobcard((prev: any) => ({
            ...prev,
            vinyl_cut_details_json: [...(Array.isArray(prev.vinyl_cut_details_json) ? prev.vinyl_cut_details_json : []), { qty: '', width: '600', type: 'Polymeric', spec: '' }]
        }));
    };

    const handleVinylRowChange = (index: number, field: string, value: string) => {
        setJobcard((prev: any) => {
            const current = Array.isArray(prev.vinyl_cut_details_json) && prev.vinyl_cut_details_json.length > 0 
                ? [...prev.vinyl_cut_details_json] 
                : [{ qty: '', width: '600', width_other: '', type: 'Polymeric', type_other: '', spec: '' }];
            
            if (!current[index]) {
                current[index] = { qty: '', width: '600', width_other: '', type: 'Polymeric', type_other: '', spec: '' };
            }
            current[index] = { ...current[index], [field]: value };
            
            return { ...prev, vinyl_cut_details_json: current };
        });
    };

    const handleRemoveVinylRow = (index: number) => {
        setJobcard((prev: any) => {
            const current = Array.isArray(prev.vinyl_cut_details_json) ? prev.vinyl_cut_details_json.filter((_: any, i: number) => i !== index) : [];
            return { ...prev, vinyl_cut_details_json: current };
        });
    };


    const handleEngImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingScan(true);
        const supabase = createClientSupabase();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `jobcards/${id}/engineer_${Date.now()}_${safeName}`;
        
        const { error: err } = await supabase.storage.from('client-uploads').upload(path, file);
        if (err) { alert('Upload failed: ' + err.message); setUploadingScan(false); return; }
        
        handleEngChange('image_path', path);
        setUploadingScan(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/portal/admin/jobcards/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobcard),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Save failed (${res.status})`);
            }
            alert('Jobcard saved!');
        } catch (e) {
            console.error(e);
            alert('Failed to save: ' + (e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAndNew = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/portal/admin/jobcards/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobcard),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Save failed (${res.status})`);
            }
            const newRes = await fetch(`/api/portal/admin/jobcards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            if (!newRes.ok) {
                const newData = await newRes.json().catch(() => ({}));
                throw new Error(newData.error || `Create new jobcard failed (${newRes.status})`);
            }
            const { id: newId } = await newRes.json();
            if (newId) {
                router.push(`/portal/admin/jobcards/${newId}`);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to save: ' + (e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleMaterialToggle = (materialName: string) => {
        setJobcard((prev: any) => {
            const current = Array.isArray(prev.materials_json) ? prev.materials_json : [];
            if (current.includes(materialName)) {
                return { ...prev, materials_json: current.filter((m: string) => m !== materialName) };
            } else {
                return { ...prev, materials_json: [...current, materialName] };
            }
        });
    };

    const handleDelete = async () => {
        if (!confirm('Are you absolutely sure you want to delete this jobcard? This action cannot be undone.')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/portal/admin/jobcards/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/portal/admin/jobcards');
            } else {
                const data = await res.json();
                alert('Failed to delete: ' + (data.error || 'Unknown error'));
                setDeleting(false);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to delete jobcard.');
            setDeleting(false);
        }
    };

    const getSignedUrl = async (storagePath: string): Promise<string> => {
        const supabase = createClientSupabase();
        const { data } = await supabase.storage.from('client-uploads').createSignedUrl(storagePath, 3600);
        return data?.signedUrl || '';
    };

    const openLightbox = async (storagePath: string) => {
        const url = await getSignedUrl(storagePath);
        if (url) { setLightboxUrl(url); setLightboxPath(storagePath); }
        else alert('Could not load file. Please check the storage bucket.');
    };

    const rotateLightbox = (delta: number) => {
        if (!lightboxPath) return;
        setJobcard((prev: any) => {
            const current = prev.file_rotations_json?.[lightboxPath] || 0;
            const next = (((current + delta) % 360) + 360) % 360;
            return { ...prev, file_rotations_json: { ...(prev.file_rotations_json || {}), [lightboxPath]: next } };
        });
    };

    const downloadFile = async (storagePath: string, displayName: string) => {
        const url = await getSignedUrl(storagePath);
        if (!url) { alert('Could not generate download link.'); return; }
        const a = document.createElement('a');
        a.href = url;
        a.download = displayName;
        a.target = '_blank';
        a.click();
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadEntries.every(en => en.file && en.name && en.description)) {
            alert('File Name, File Upload, and Description are compulsory for all files.');
            return;
        }
        setUploadingFiles(true); setUploadProgress(0);
        const supabase = createClientSupabase();
        
        try {
            const uploaded: any[] = [];
            for (let i = 0; i < uploadEntries.length; i++) {
                const en = uploadEntries[i]; if (!en.file) continue;
                const safeName = en.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const path = `jobcards/${id}/${Date.now()}_${safeName}`;
                const { error: err } = await supabase.storage.from('client-uploads').upload(path, en.file, { upsert: false });
                if (err) throw err;
                uploaded.push({
                    storagePath: path,
                    originalName: en.file.name,
                    displayName: en.name.trim(),
                    description: en.description
                });
                setUploadProgress(Math.round(((i + 1) / uploadEntries.length) * 100));
            }
            
            const currentFiles = Array.isArray(jobcard.files_json) ? jobcard.files_json : [];
            const newFiles = [...currentFiles, ...uploaded];
            
            setJobcard((prev: any) => ({ ...prev, files_json: newFiles }));
            setShowUploadModal(false);
            setUploadEntries([createEntry()]);
        } catch (err: any) {
            alert(err.message || 'Upload failed.');
        } finally {
            setUploadingFiles(false);
        }
    };

    const removeFile = (index: number) => {
        if (!confirm('Remove this file?')) return;
        setJobcard((prev: any) => {
            const currentFiles = Array.isArray(prev.files_json) ? prev.files_json : [];
            const newFiles = [...currentFiles];
            newFiles.splice(index, 1);
            return { ...prev, files_json: newFiles };
        });
    };

    // Ensure Captured is ticked by default if missing
    useEffect(() => {
        if (jobcard && (!jobcard.status_workflow_json || !jobcard.status_workflow_json.captured)) {
            const workflow = jobcard.status_workflow_json || {};
            if (!workflow.captured) {
                setJobcard((prev: any) => ({
                    ...prev,
                    status_workflow_json: {
                        ...workflow,
                        captured: { ticked: true, ticked_at: prev.created_at || new Date().toISOString() }
                    }
                }));
            }
        }
    }, [jobcard]);

    // Adds a new blank item to the array
    const handleAddItem = () => {
        setJobcard((prev: any) => ({
            ...prev,
            items_json: [...(prev.items_json || []), { quantity: '', size: '', item: '', description: '', price: '', total: '' }]
        }));
    };

    // Removes an item at a specific index
    const handleRemoveItem = (index: number) => {
        setJobcard((prev: any) => {
            const updatedItems = (prev.items_json || []).filter((_: any, i: number) => i !== index);
            
            // Recalculate totals
            const subtotal = updatedItems.reduce((acc: number, item: any) => acc + (parseFloat(item.total) || 0), 0);
            const vat = subtotal * 0.15;
            const total = subtotal + vat;

            return { 
                ...prev, 
                items_json: updatedItems,
                sub_total: subtotal.toFixed(2),
                vat_total: vat.toFixed(2),
                total: total.toFixed(2)
            };
        });
    };

    // Updates a specific field in a specific item
    const handleItemChange = (index: number, field: string, value: string) => {
        setJobcard((prev: any) => {
            const updatedItems = [...(prev.items_json || [])];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            
            // Auto-calculate line total
            if (field === 'quantity' || field === 'price') {
                const qty = parseFloat(updatedItems[index].quantity) || 0;
                const price = parseFloat(updatedItems[index].price) || 0;
                updatedItems[index].total = (qty * price).toFixed(2);
            }

            // Calculate global totals
            const subtotal = updatedItems.reduce((acc: number, item: any) => acc + (parseFloat(item.total) || 0), 0);
            const vat = subtotal * 0.15;
            const total = subtotal + vat;
            
            return { 
                ...prev, 
                items_json: updatedItems,
                sub_total: subtotal.toFixed(2),
                vat_total: vat.toFixed(2),
                total: total.toFixed(2)
            };
        });
    };

    const recalculateTotals = () => {
        const items = Array.isArray(jobcard.items_json) ? jobcard.items_json : [];
        const subtotal = items.reduce((acc: number, item: any) => acc + (parseFloat(item.total) || 0), 0);
        const vat = subtotal * 0.15;
        const total = subtotal + vat;
        
        setJobcard((prev: any) => ({
            ...prev,
            sub_total: subtotal.toFixed(2),
            vat_total: vat.toFixed(2),
            total: total.toFixed(2)
        }));
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-transparent text-white">Loading...</div>;
    if (!jobcard) return <div className="min-h-screen flex items-center justify-center bg-transparent text-white">Not Found</div>;


    return (
        <div className="min-h-[100dvh] bg-transparent p-4 md:p-8 font-inter">
            <div className="max-w-[1000px] mx-auto">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <Link href="/portal/admin/jobcards" className="text-[#84cc16] hover:text-[#84cc16]/80 font-semibold text-sm">← Back to Jobcards</Link>
                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md px-4 py-2 text-sm font-bold shadow-sm flex items-center justify-center min-w-40 text-white">
                             Status: {jobcard.status || 'Quoted'}
                        </div>
                        <button onClick={handleDelete} disabled={deleting} className="bg-red-500/10 text-red-500 border border-red-500/30 px-4 py-2 rounded-md font-bold shadow-sm hover:bg-red-500/20 disabled:opacity-50">
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button onClick={handleSave} disabled={saving} className="bg-[#84cc16] text-[#0a0a0a] px-6 py-2 rounded-md font-bold shadow-md hover:bg-[#84cc16]/90 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Jobcard'}
                        </button>
                        <button onClick={handleSaveAndNew} disabled={saving} className="bg-[#84cc16]/80 text-[#0a0a0a] px-6 py-2 rounded-md font-bold shadow-md hover:bg-[#84cc16]/90 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save & Add Jobcard'}
                        </button>
                    </div>
                </div>

                {/* Jobcard Container (Paper look simulation) */}
                <div className="bg-white shadow-xl max-w-[1000px] mx-auto border border-gray-300 p-8 text-gray-900" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px)', backgroundSize: '100% 40px' }}>
                    
                    {/* Header Layout */}
                    <div className="flex border border-black mb-6 flex-wrap lg:flex-nowrap" onClick={() => setShowSuggestions(false)}>
                        {/* Logo Box */}
                        <div className="w-full lg:w-36 border-b lg:border-b-0 lg:border-r border-black p-2 flex flex-col items-center justify-center bg-gray-50">
                            <Image src="/aloe-logo.png" alt="Aloe Signs" width={90} height={30} className="object-contain" priority />
                            <p className="text-[7px] tracking-widest uppercase mt-1 font-bold text-gray-600">Create Manufacture Install</p>
                        </div>

                        {/* Customer Info (Block 2) */}
                        <div className="w-full lg:w-[40%] border-b lg:border-b-0 lg:border-r border-black flex flex-col relative" onClick={e => e.stopPropagation()}>
                            <div className="flex border-b border-gray-300 relative">
                                <span className="w-24 uppercase text-[10px] text-gray-500 font-bold py-2 px-2 border-r border-gray-300 flex items-center bg-gray-50">Company:</span>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        name="company" 
                                        value={jobcard.company || ''} 
                                        onChange={handleCompanyChange} 
                                        onFocus={() => { if (companySuggestions.length > 0) setShowSuggestions(true); }}
                                        className="w-full py-1 px-3 text-sm focus:outline-none focus:bg-blue-50 bg-white font-medium text-gray-800" 
                                    />
                                    {showSuggestions && companySuggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 shadow-lg z-10 max-h-40 overflow-y-auto">
                                            {companySuggestions.map((item, idx) => (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => selectCompany(item)} 
                                                    className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 text-xs text-gray-800"
                                                >
                                                    <div className="font-bold">{item.customer}</div>
                                                    {(item.contact || item.mobile_1) && (
                                                        <div className="text-gray-500 text-[10px]">
                                                            {[item.contact, item.mobile_1].filter(Boolean).join(' · ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <InputLine label="Contact:" name="contact_name" jobcard={jobcard} handleChange={handleChange} />
                            <div className="flex border-b border-gray-300">
                                <span className="w-24 uppercase text-[10px] text-gray-500 font-bold py-2 px-2 border-r border-gray-300 flex items-center bg-gray-50">Tel:</span>
                                <input
                                    type="text"
                                    name="contact_phone"
                                    value={jobcard.contact_phone || ''}
                                    onChange={handleChange}
                                    placeholder="Mobile 1"
                                    className="flex-1 min-w-0 py-1 px-3 text-sm focus:outline-none focus:bg-blue-50 bg-white font-medium text-gray-800 border-r border-gray-300"
                                />
                                <input
                                    type="text"
                                    name="contact_phone_2"
                                    value={jobcard.contact_phone_2 || ''}
                                    onChange={handleChange}
                                    placeholder="Mobile 2"
                                    className="flex-1 min-w-0 py-1 px-3 text-sm focus:outline-none focus:bg-blue-50 bg-white font-medium text-gray-800"
                                />
                            </div>
                            <InputLine label="Email:" name="email" jobcard={jobcard} handleChange={handleChange} />
                        </div>

                        {/* Job Info (Block 3) */}
                        <div className="w-full lg:w-[35%] border-b lg:border-b-0 lg:border-r border-black flex flex-col">
                            <InputLine label="Invoice:" name="invoice" jobcard={jobcard} handleChange={handleChange} />
                            <InputLine label="Quote No:" name="quote_number" jobcard={jobcard} handleChange={handleChange} />
                            <InputLine label="PO No:" name="purchase_order_number" jobcard={jobcard} handleChange={handleChange} />
                            <div className="flex border-b border-gray-300 flex-1">
                                <span className="w-24 uppercase text-[10px] text-gray-500 font-bold py-2 px-2 border-r border-gray-300 flex items-start bg-gray-50">Address:</span>
                                <textarea name="address" value={jobcard.address || ''} onChange={handleChange} className="flex-1 py-1 px-3 text-sm focus:outline-none focus:bg-blue-50 bg-white font-medium resize-none text-gray-800 h-full" rows={2} />
                            </div>
                        </div>

                        {/* Entry box */}
                        <div className="w-full lg:w-32 border-t lg:border-t-0 lg:border-l border-black flex flex-col">
                            <div className="p-2 border-b border-gray-300 flex-1 bg-gray-50">
                                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Entry #</span>
                                <input type="text" name="entry_number" value={jobcard.entry_number || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 p-1 text-sm focus:outline-none" />
                            </div>
                            <div className="p-2 flex-1 bg-gray-50">
                                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Date:</span>
                                <input type="date" name="date" value={jobcard.date || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 p-1 text-sm focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Status Workflow Checklist Bar */}
                    <div className="border border-black bg-white mb-6 flex divide-x divide-gray-300 shadow-sm">
                        <div className="p-2 bg-gray-50 flex items-center border-r border-black">
                            <span className="text-[10px] font-bold text-gray-600 uppercase">Workflow</span>
                        </div>
                        <div className="flex-1 flex justify-around p-1 flex-wrap gap-1">
                            <StatusCheckbox label="Captured" name="captured" jobcard={jobcard} setJobcard={setJobcard} />
                            <StatusCheckbox label="Quote Sent" name="quote_sent" jobcard={jobcard} setJobcard={setJobcard} />
                            <StatusCheckbox label="Deposit Paid / PO" name="deposit_paid" jobcard={jobcard} setJobcard={setJobcard} />
                            <StatusCheckbox label="Proof Sent" name="proof_sent" jobcard={jobcard} setJobcard={setJobcard} />
                            <StatusCheckbox label="Approved" name="approved" jobcard={jobcard} setJobcard={setJobcard} />
                            <StatusCheckbox label="Ready" name="ready_collection" jobcard={jobcard} setJobcard={setJobcard} />
                            <StatusCheckbox label="Completed" name="completed" jobcard={jobcard} setJobcard={setJobcard} />
                        </div>
                    </div>

                    {/* Main Grid Area */}
                    <div className="flex border border-black min-h-[500px] flex-wrap lg:flex-nowrap">
                        {/* Design Canvas/Items & Notes */}
                        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-black flex flex-col relative bg-[#f8fafc]">
                            
                            {/* Items Table Section */}
                            <div className="flex-1 flex flex-col overflow-hidden border-b border-gray-300">
                                <div className="p-2 border-b border-gray-200 bg-white flex-shrink-0">
                                    <span className="text-xs font-bold text-gray-600 uppercase">Items</span>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto">
                                    <table className="w-full text-sm text-left text-gray-600 border-collapse table-fixed">
                                        <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 border-b sticky top-0 z-10">
                                            <tr>
                                                <th className="px-2 py-2 w-[80px]">Quantity</th>
                                                <th className="px-2 py-2 w-[100px]">Size</th>
                                                <th className="px-2 py-2">Item</th>
                                                <th className="px-2 py-2 w-[120px]">Price (Excl.)</th>
                                                <th className="px-2 py-2 w-[100px]">Total</th>
                                                <th className="px-2 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(jobcard.items_json || []).map((item: any, index: number) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 group">
                                                    <td className="p-0 align-top" colSpan={6}>
                                                        <table className="w-full table-fixed border-collapse">
                                                            <tbody>
                                                                <tr>
                                                                    <td className="px-1 py-1 w-[80px]">
                                                                        <input 
                                                                            type="number" 
                                                                            min="0"
                                                                            value={item.quantity || ''} 
                                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                                            className="w-full bg-transparent border border-gray-200 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-aloe-green/30 focus:border-aloe-green/30"
                                                                        />
                                                                    </td>
                                                                    <td className="px-1 py-1 w-[100px]">
                                                                        <input 
                                                                            type="text" 
                                                                            value={item.size || ''} 
                                                                            onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                                                                            className="w-full bg-transparent border border-gray-200 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-aloe-green/30 focus:border-aloe-green/30"
                                                                        />
                                                                    </td>
                                                                    <td className="px-1 py-1">
                                                                        {item.itemCustom === 'true' ? (
                                                                            <>
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.item || ''}
                                                                                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                                                                                    placeholder="Custom item name..."
                                                                                    className="w-full bg-white border border-gray-200 rounded p-1 text-xs focus:outline-none focus:ring-1 focus:ring-aloe-green/30 focus:border-aloe-green/30 font-medium truncate"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        handleItemChange(index, 'itemCustom', 'false');
                                                                                        handleItemChange(index, 'item', '');
                                                                                    }}
                                                                                    className="text-[9px] text-gray-400 mt-0.5 px-1 hover:text-aloe-green focus:outline-none"
                                                                                >
                                                                                    ↩ Use dropdown list
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <select
                                                                                    value={item.item || ''}
                                                                                    onChange={(e) => {
                                                                                        if (e.target.value === '__custom__') {
                                                                                            handleItemChange(index, 'itemCustom', 'true');
                                                                                        } else {
                                                                                            handleItemChange(index, 'item', e.target.value);
                                                                                        }
                                                                                    }}
                                                                                    className="w-full bg-white border border-gray-200 rounded p-1 text-xs focus:outline-none focus:ring-1 focus:ring-aloe-green/30 focus:border-aloe-green/30 font-medium truncate"
                                                                                >
                                                                                    <option value="">Select Item...</option>
                                                                                    {JOBCARD_ITEM_OPTIONS.map((opt, i) => (
                                                                                        <option key={i} value={opt.label}>
                                                                                            {opt.label}
                                                                                        </option>
                                                                                    ))}
                                                                                    <option value="__custom__">+ Add Custom Item...</option>
                                                                                </select>
                                                                                {item.item && (
                                                                                    <div className="text-[9px] text-gray-400 mt-0.5 px-1 truncate leading-tight">
                                                                                        {JOBCARD_ITEM_OPTIONS.find(o => o.label === item.item)?.description}
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-1 py-1 w-[120px]">
                                                                        <input 
                                                                            type="number" 
                                                                            step="0.01" 
                                                                            min="0"
                                                                            value={item.price || ''} 
                                                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                                            className="w-full bg-transparent border border-gray-200 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-aloe-green/30 focus:border-aloe-green/30"
                                                                        />
                                                                    </td>
                                                                    <td className="px-1 py-1 w-[100px]">
                                                                        <input 
                                                                            type="text" 
                                                                            readOnly
                                                                            value={item.total || '0.00'} 
                                                                            className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-sm text-right font-mono"
                                                                        />
                                                                    </td>
                                                                    <td className="px-1 py-1 w-10 text-center">
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleRemoveItem(index)}
                                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                                            title="Remove item"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td colSpan={6} className="px-1 pb-2">
                                                                        <textarea 
                                                                            value={item.description || ''} 
                                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                                            placeholder="Detailed description for this item..."
                                                                            rows={1}
                                                                            className="w-full bg-transparent border border-gray-100 rounded p-1 text-xs focus:outline-none focus:ring-1 focus:ring-aloe-green/30 focus:border-aloe-green/30 resize-y min-h-[30px] italic text-gray-500"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!jobcard.items_json || jobcard.items_json.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-4 text-gray-400 italic text-xs">
                                                        No items added yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex-shrink-0 p-2 bg-white border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={handleAddItem}
                                        className="w-full py-1.5 border-2 border-dashed border-gray-300 rounded text-sm font-medium text-gray-500 hover:border-black hover:text-black transition-colors"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                {/* Financials relocated to bottom of items list */}
                                <div className="mt-auto bg-gray-50 flex flex-col border-t border-gray-300">
                                    <div className="flex border-b border-gray-200">
                                        <div className="w-32 text-xs font-bold p-2 flex flex-col justify-center border-r border-gray-200 bg-gray-100/50">
                                            <span className="text-gray-700">Sub Total</span>
                                            <button 
                                                type="button"
                                                onClick={recalculateTotals}
                                                className="text-[8px] text-blue-500 hover:underline mt-0.5 text-left font-medium"
                                            >
                                                (Recalculate from items)
                                            </button>
                                        </div>
                                        <input type="number" step="0.01" name="sub_total" value={jobcard.sub_total || ''} onChange={handleChange} className="flex-1 w-full bg-white px-3 focus:outline-none focus:bg-blue-50 text-gray-800 font-medium" />
                                    </div>
                                    <div className="flex border-b border-gray-200">
                                        <span className="w-32 text-xs font-bold p-2 flex items-center border-r border-gray-200 bg-gray-100/50 text-gray-700">15% VAT</span>
                                        <input type="number" step="0.01" name="vat_total" value={jobcard.vat_total || ''} onChange={handleChange} className="flex-1 w-full bg-white px-3 focus:outline-none focus:bg-blue-50 text-gray-800 font-medium" />
                                    </div>
                                    <div className="flex border-b border-gray-300">
                                        <span className="w-32 text-xs font-bold p-2 flex items-center border-r border-gray-200 bg-gray-200/50 text-gray-800">Total</span>
                                        <input type="number" step="0.01" name="total" value={jobcard.total || ''} onChange={handleChange} className="flex-1 w-full font-bold bg-white px-3 focus:outline-none focus:bg-blue-50 text-gray-900 text-lg" />
                                    </div>
                                </div>
                            </div>

                            {/* Other Notes Section - Shrinked to save space */}
                            <div className="flex-none h-32 flex flex-col overflow-hidden border-t border-gray-100">
                                <div className="p-1.5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0 flex items-center">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase ml-2">Other Notes</span>
                                </div>
                                <textarea 
                                    name="design_notes" 
                                    value={jobcard.design_notes || ''} 
                                    onChange={handleChange}
                                    placeholder="Artwork links, extra instructions..."
                                    className="flex-1 w-full bg-transparent text-gray-800 p-3 resize-none focus:outline-none focus:ring-0 text-xs"
                                    style={{
                                        backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
                                        backgroundSize: '20px 20px',
                                        lineHeight: '20px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Toggles & Checklists */}
                        <div className="w-full lg:w-96 flex flex-col bg-white">
                            {/* Department Section */}
                            <div className="border-b border-gray-300">
                                <div className="p-2 bg-gray-100 border-b border-gray-300">
                                    <span className="text-xs font-bold text-gray-700 uppercase">Department</span>
                                </div>
                                <div className="grid grid-cols-1 gap-x-2">
                                    <DeptRow label="Artwork" name="prod_artwork" deptKey="artwork" jobcard={jobcard} handleChange={handleChange} setJobcard={setJobcard} me={me} />
                                    {jobcard.prod_artwork && (
                                        <div className="p-3 bg-gray-50 border-b border-gray-300 text-sm flex flex-col gap-2">
                                            {/* Sign-off milestones */}
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide">Sign-off</span>
                                                {['proof_sent', 'approved', 'received'].map(key => {
                                                    const milestone = jobcard.artwork_details_json?.milestones?.[key] || {};
                                                    const done = milestone.done === true;
                                                    return (
                                                        <label key={key} className="flex items-center justify-between py-1 px-1 hover:bg-white/40 rounded">
                                                            <span className="text-[10px] font-medium text-gray-700">{key === 'proof_sent' ? 'Proof Sent' : key === 'approved' ? 'Approved' : 'Received'}</span>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={done}
                                                                    onChange={e => {
                                                                        if (e.target.checked) {
                                                                            handleArtworkMilestone(key, { done: true, date: new Date().toISOString().slice(0, 10) });
                                                                        } else {
                                                                            handleArtworkMilestone(key, { done: false });
                                                                        }
                                                                    }}
                                                                    className="w-3 h-3 text-aloe-green/80 rounded border-gray-300 cursor-pointer"
                                                                />
                                                                {done && (
                                                                    <input
                                                                        type="date"
                                                                        value={milestone.date || ''}
                                                                        onChange={e => handleArtworkMilestone(key, { date: e.target.value, done: true })}
                                                                        className="w-28 border border-gray-300 p-0.5 text-xs bg-white text-gray-800"
                                                                    />
                                                                )}
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            {/* Hours row */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] uppercase font-bold text-gray-500">Hours</span>
                                                <input
                                                    type="text"
                                                    value={jobcard.artwork_details_json?.hours || ''}
                                                    onChange={e => handleArtworkChange('hours', e.target.value)}
                                                    className="w-20 border border-gray-300 p-1 text-xs bg-white text-gray-800"
                                                />
                                            </div>
                                            {/* Rate row */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] uppercase font-bold text-gray-500">Rate</span>
                                                <input
                                                    type="text"
                                                    value={jobcard.artwork_details_json?.rate || ''}
                                                    placeholder={String(getArtworkRate(jobcard, settings))}
                                                    onChange={e => handleArtworkChange('rate', e.target.value)}
                                                    className="w-20 border border-gray-300 p-1 text-xs bg-white text-gray-800"
                                                />
                                            </div>
                                            {/* Charge display */}
                                            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                                                <span className="text-[10px] uppercase font-bold text-gray-500">Charge</span>
                                                <span className="font-bold text-gray-800 text-xs">
                                                    R {computeArtworkCharge(jobcard, settings).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <DeptRow label="UV Flatbed" name="prod_flatbed" deptKey="flatbed" jobcard={jobcard} handleChange={handleChange} setJobcard={setJobcard} me={me} />
                                    {jobcard.prod_flatbed && (
                                        <div className="flex flex-col border-b border-gray-300 bg-blue-50/50 p-3 gap-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Qty</label>
                                                    <input type="number" min="0" value={jobcard.flatbed_details_json?.qty || ''} onChange={e => handleFlatbedChange('qty', e.target.value)} className="w-full border border-gray-300 p-1 text-xs focus:outline-none bg-white text-gray-800" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Size</label>
                                                    <input type="text" value={jobcard.flatbed_details_json?.size || ''} onChange={e => handleFlatbedChange('size', e.target.value)} className="w-full border border-gray-300 p-1 text-xs focus:outline-none bg-white text-gray-800" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 mt-1">Type</label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                                                        <input type="radio" name="flatbed_type" checked={jobcard.flatbed_details_json?.type === 'SINGLE'} onChange={() => handleFlatbedChange('type', 'SINGLE')} className="text-aloe-green" /> Single
                                                    </label>
                                                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                                                        <input type="radio" name="flatbed_type" checked={jobcard.flatbed_details_json?.type === 'DOUBLE'} onChange={() => handleFlatbedChange('type', 'DOUBLE')} className="text-aloe-green" /> Double
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 mt-1">Shape</label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                                                        <input type="radio" name="flatbed_shape" checked={jobcard.flatbed_details_json?.shape === 'RECTANGLE'} onChange={() => handleFlatbedChange('shape', 'RECTANGLE')} className="text-aloe-green" /> Rectangle
                                                    </label>
                                                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                                                        <input type="radio" name="flatbed_shape" checked={jobcard.flatbed_details_json?.shape === 'CUT OUT'} onChange={() => handleFlatbedChange('shape', 'CUT OUT')} className="text-aloe-green" /> Cut Out
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 mt-1">Mirror</label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                                                        <input type="radio" name="flatbed_mirror" checked={jobcard.flatbed_details_json?.mirror === 'YES'} onChange={() => handleFlatbedChange('mirror', 'YES')} className="text-aloe-green" /> Yes
                                                    </label>
                                                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                                                        <input type="radio" name="flatbed_mirror" checked={jobcard.flatbed_details_json?.mirror === 'NO'} onChange={() => handleFlatbedChange('mirror', 'NO')} className="text-aloe-green" /> No
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-2 border-t border-gray-200 pt-2">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-2">Material</label>
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                                    {FLATBED_MATERIALS.map(m => (
                                                        <label key={m} className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 cursor-pointer border border-gray-100 rounded bg-white">
                                                            <span className="text-[10px] font-medium text-gray-700">{m}</span>
                                                            <input type="checkbox" checked={Array.isArray(jobcard.materials_json) && jobcard.materials_json.includes(m)} onChange={() => handleMaterialToggle(m)} className="w-3 h-3 text-aloe-green/80 rounded border-gray-300 cursor-pointer" />
                                                        </label>
                                                    ))}
                                                </div>
                                                {Array.isArray(jobcard.materials_json) && (jobcard.materials_json.includes('Other') || jobcard.materials_json.includes('OTHER')) && (
                                                    <div className="mt-2">
                                                        <input 
                                                            type="text" 
                                                            name="materials_other_text"
                                                            value={jobcard.materials_other_text || ''} 
                                                            onChange={handleChange}
                                                            placeholder="Specify other material..."
                                                            className="w-full border border-gray-300 p-1.5 text-xs bg-white text-gray-800 focus:outline-none focus:border-aloe-green/50"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <DeptRow label="HP Latex" name="prod_digital" deptKey="digital" jobcard={jobcard} handleChange={handleChange} setJobcard={setJobcard} me={me} />
                                    {jobcard.prod_digital && (
                                        <div className="flex flex-col border-b border-gray-300 bg-blue-50/50 p-2 text-xs overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-300">
                                                        <th className="p-1 font-bold text-gray-500 uppercase">Material</th>
                                                        <th className="p-1 font-bold text-gray-500 uppercase w-16">Meters</th>
                                                        <th className="p-1 font-bold text-gray-500 uppercase w-20">Cost</th>
                                                        <th className="p-1 w-8"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(getHpLatexRows(jobcard).length > 0 ? getHpLatexRows(jobcard) : [{ material: '', meters: '' }]).map((row: any, idx: number) => (
                                                        <tr key={idx} className="border-b border-gray-100 align-top">
                                                            <td className="p-1">
                                                                <select value={row.material || ''} onChange={e => handleHpLatexRowChange(idx, 'material', e.target.value)} className="w-full border border-gray-300 p-1 focus:outline-none bg-white text-gray-800">
                                                                    <option value="">Select material...</option>
                                                                    {getHpLatexMaterials(settings).map(m => (
                                                                        <option key={m.name} value={m.name}>{m.name} (R {m.price})</option>
                                                                    ))}
                                                                </select>
                                                                {row.material === 'Other' && (
                                                                    <div className="flex gap-1 mt-1">
                                                                        <input type="text" placeholder="Name..." value={row.type_other || ''} onChange={e => handleHpLatexRowChange(idx, 'type_other', e.target.value)} className="w-1/2 border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                                        <input type="number" step="0.01" min="0" placeholder="R/m" value={row.custom_price || ''} onChange={e => handleHpLatexRowChange(idx, 'custom_price', e.target.value)} className="w-1/2 border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-1">
                                                                <input type="number" step="0.01" min="0" value={row.meters || ''} onChange={e => handleHpLatexRowChange(idx, 'meters', e.target.value)} placeholder="Meters" className="w-full border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                            </td>
                                                            <td className="p-1 text-gray-700 font-medium whitespace-nowrap">
                                                                R {((parseFloat(row.meters) || 0) * getHpLatexRowRate(row, settings)).toFixed(2)}
                                                            </td>
                                                            <td className="p-1 text-center">
                                                                <button type="button" onClick={() => handleRemoveHpLatexRow(idx)} className="text-gray-300 hover:text-red-500" title="Remove">✕</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button type="button" onClick={handleAddHpLatexRow} className="mt-2 w-full py-1 border border-dashed border-gray-300 rounded text-[11px] font-medium text-gray-500 hover:border-black hover:text-black">+ Add product</button>
                                            <div className="mt-2 border-t border-gray-200 pt-2">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Date Printed</label>
                                                <input type="date" value={jobcard.digital_details_json?.print_date ?? ''} onChange={(e) => handleDigitalChange('print_date', e.target.value)} className="w-40 border border-gray-300 p-1.5 text-xs bg-white text-gray-800 focus:outline-none focus:border-aloe-green/50" />
                                            </div>
                                            <div className="px-1 pt-2 text-xs flex items-center justify-end border-t border-gray-200 mt-2">
                                                <span className="font-bold text-gray-700">Charge: R {computeHpLatexCharge(jobcard, settings).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                    <DeptRow label="HP Vinyl Cut" name="prod_vinyl_cut" deptKey="vinyl_cut" jobcard={jobcard} handleChange={handleChange} setJobcard={setJobcard} me={me} />
                                    {jobcard.prod_vinyl_cut && (
                                        <div className="flex flex-col border-b border-gray-300 bg-blue-50/50 p-2 text-xs overflow-x-auto">
                                            <label className="flex items-center justify-between px-1 py-1 mb-1 cursor-pointer">
                                                <span className="text-[10px] uppercase font-bold text-gray-500">Print &amp; Cut <span className="text-gray-400 normal-case font-normal">(+R200)</span></span>
                                                <input type="checkbox" name="vinyl_cut_printcut" checked={!!jobcard.vinyl_cut_printcut} onChange={handleChange} className="w-4 h-4 text-aloe-green/80 rounded border-gray-300 cursor-pointer" />
                                            </label>
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-300">
                                                        <th className="p-1 font-bold text-gray-500 uppercase w-16">R.Meters</th>
                                                        <th className="p-1 font-bold text-gray-500 uppercase">Width</th>
                                                        <th className="p-1 font-bold text-gray-500 uppercase">Material</th>
                                                        <th className="p-1 font-bold text-gray-500 uppercase w-20">Cost</th>
                                                        <th className="p-1 w-8"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {((Array.isArray(jobcard.vinyl_cut_details_json) && jobcard.vinyl_cut_details_json.length > 0) ? jobcard.vinyl_cut_details_json : [{ qty: '', width: '600', type: 'Mask/Pos', spec: '' }]).map((row: any, idx: number) => (
                                                        <tr key={idx} className="border-b border-gray-100 flex flex-wrap sm:table-row">
                                                            <td className="p-1 align-top block sm:table-cell w-full sm:w-auto">
                                                                <input type="number" step="0.01" min="0" value={row.qty || ''} onChange={e => handleVinylRowChange(idx, 'qty', e.target.value)} placeholder="Meters" className="w-full border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                            </td>
                                                            <td className="p-1 align-top block sm:table-cell w-full sm:w-auto">
                                                                <select value={row.width || '600'} onChange={e => handleVinylRowChange(idx, 'width', e.target.value)} className="w-full border border-gray-300 p-1 focus:outline-none bg-white text-gray-800 mb-1">
                                                                    <option value="600">600</option>
                                                                    <option value="1200">1200</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-1 align-top block sm:table-cell w-full sm:w-auto">
                                                                <select value={row.type || 'Mask/Pos'} onChange={e => handleVinylRowChange(idx, 'type', e.target.value)} className="w-full border border-gray-300 p-1 focus:outline-none bg-white text-gray-800 mb-1">
                                                                    {getVinylCutMaterials(settings).map(m => (
                                                                        <option key={m.name} value={m.name}>{m.name}</option>
                                                                    ))}
                                                                </select>
                                                                {row.type === 'Other' && (
                                                                    <div className="flex gap-1">
                                                                        <input type="text" placeholder="Name..." value={row.type_other || ''} onChange={e => handleVinylRowChange(idx, 'type_other', e.target.value)} className="w-1/2 border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                                        <input type="number" step="0.01" min="0" placeholder="R/m" value={row.custom_price || ''} onChange={e => handleVinylRowChange(idx, 'custom_price', e.target.value)} className="w-1/2 border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-1 align-top block sm:table-cell w-full sm:w-auto text-gray-700 font-medium whitespace-nowrap">
                                                                R {((parseFloat(row.qty) || 0) * getVinylCutRowRate(row, settings)).toFixed(2)}
                                                            </td>
                                                            <td className="p-1 align-top block sm:table-cell text-center">
                                                                <button type="button" onClick={() => handleRemoveVinylRow(idx)} className="text-gray-300 hover:text-red-500" title="Remove">✕</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button type="button" onClick={handleAddVinylRow} className="mt-2 w-full py-1 border border-dashed border-gray-300 rounded text-[11px] font-medium text-gray-500 hover:border-black hover:text-black">+ Add product</button>
                                            <div className="p-1 w-full mt-2 border-t border-gray-200 pt-2">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Specs</label>
                                                {((Array.isArray(jobcard.vinyl_cut_details_json) && jobcard.vinyl_cut_details_json.length > 0) ? jobcard.vinyl_cut_details_json : [{ qty: '', width: '600', type: 'Mask/Pos', spec: '' }]).map((row: any, idx: number) => (
                                                    <textarea key={`spec-${idx}`} value={row.spec || ''} onChange={e => handleVinylRowChange(idx, 'spec', e.target.value)} rows={3} placeholder="Enter detailed specs here..." className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800 resize-y" />
                                                ))}
                                            </div>
                                            <div className="px-1 pt-2 text-xs flex items-center justify-end border-t border-gray-200 mt-2">
                                                <span className="font-bold text-gray-700">Charge: R {computeVinylCutCharge(jobcard, settings).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                    <DeptRow label="Screen" name="prod_screen" deptKey="screen" jobcard={jobcard} handleChange={handleChange} setJobcard={setJobcard} me={me} />
                                    {jobcard.prod_screen && (
                                        <div className="flex flex-col border-b border-gray-300 bg-orange-50/50 p-3 text-xs gap-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">QTY</label>
                                                    <input 
                                                        type="text" 
                                                        value={jobcard.screen_details_json?.qty || ''} 
                                                        onChange={e => handleScreenChange('qty', e.target.value)} 
                                                        placeholder="Enter quantity..."
                                                        className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">SIDES</label>
                                                    <select 
                                                        value={jobcard.screen_details_json?.sides || 'Single Sided'} 
                                                        onChange={e => handleScreenChange('sides', e.target.value)} 
                                                        className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800"
                                                    >
                                                        <option value="Single Sided">Single Sided</option>
                                                        <option value="Double Sided">Double Sided</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">MATERIAL</label>
                                                    <select 
                                                        value={jobcard.screen_details_json?.material || '0.9 ABS'} 
                                                        onChange={e => handleScreenChange('material', e.target.value)} 
                                                        className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800 mb-1"
                                                    >
                                                        <option value="0.9 ABS">0.9 ABS</option>
                                                        <option value="1.5 ABS">1.5 ABS</option>
                                                        <option value="2.0 ABS">2.0 ABS</option>
                                                        <option value="3.0 ABS">3.0 ABS</option>
                                                        <option value="0.6 Chromadek">0.6 Chromadek</option>
                                                        <option value="3.0 Correx">3.0 Correx</option>
                                                        <option value="3.5 Correx">3.5 Correx</option>
                                                        <option value="4.0 Correx">4.0 Correx</option>
                                                        <option value="Bulk Bags">Bulk Bags</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    {jobcard.screen_details_json?.material === 'Other' && (
                                                        <input 
                                                            type="text" 
                                                            placeholder="Specify material..." 
                                                            value={jobcard.screen_details_json?.material_other || ''} 
                                                            onChange={e => handleScreenChange('material_other', e.target.value)} 
                                                            className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800" 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">SPECS</label>
                                                <textarea 
                                                    value={jobcard.screen_details_json?.specs || ''} 
                                                    onChange={e => handleScreenChange('specs', e.target.value)} 
                                                    rows={3} 
                                                    placeholder="Enter detailed screen printing specs here..." 
                                                    className="w-full border border-gray-300 p-2 focus:outline-none bg-white text-gray-800 resize-y" 
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <DeptRow label="Application" name="prod_applicate" deptKey="applicate" jobcard={jobcard} handleChange={handleChange} setJobcard={setJobcard} me={me} />
                                    {jobcard.prod_applicate && (
                                        <div className="flex flex-col border-b border-gray-300 bg-green-50/50 p-3 text-xs gap-3">
                                            <div className="flex flex-wrap gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={jobcard.applicate_details_json?.lam || false} 
                                                        onChange={e => handleApplicateChange('lam', e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-300 text-aloe-green focus:ring-aloe-green"
                                                    />
                                                    <span className="font-bold text-gray-700 uppercase group-hover:text-aloe-green transition-colors">LAM</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={jobcard.applicate_details_json?.vehicle || false} 
                                                        onChange={e => handleApplicateChange('vehicle', e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-300 text-aloe-green focus:ring-aloe-green"
                                                    />
                                                    <span className="font-bold text-gray-700 uppercase group-hover:text-aloe-green transition-colors">VEHICLE</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={jobcard.applicate_details_json?.on_site || false} 
                                                        onChange={e => handleApplicateChange('on_site', e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-300 text-aloe-green focus:ring-aloe-green"
                                                    />
                                                    <span className="font-bold text-gray-700 uppercase group-hover:text-aloe-green transition-colors">ON SITE</span>
                                                </label>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">ADDITIONAL NOTES</label>
                                                <textarea 
                                                    value={jobcard.applicate_details_json?.notes || ''} 
                                                    onChange={e => handleApplicateChange('notes', e.target.value)} 
                                                    rows={2} 
                                                    placeholder="Enter any application specific notes..." 
                                                    className="w-full border border-gray-300 p-2 focus:outline-none bg-white text-gray-800 resize-y" 
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <DeptRow label="Engineer" name="prod_engineer" deptKey="engineer" jobcard={jobcard} handleChange={handleChange} setJobcard={setJobcard} me={me} />
                                    {jobcard.prod_engineer && (
                                        <div className="flex flex-col border-b border-gray-300 bg-blue-50/50 p-3 text-xs gap-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">QTY</label>
                                                    <input 
                                                        type="text" 
                                                        value={jobcard.engineer_details_json?.quantity || ''} 
                                                        onChange={e => handleEngChange('quantity', e.target.value)} 
                                                        className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">SIZE</label>
                                                    <input 
                                                        type="text" 
                                                        value={jobcard.engineer_details_json?.size || ''} 
                                                        onChange={e => handleEngChange('size', e.target.value)} 
                                                        placeholder="e.g. 1000x500"
                                                        className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">MATERIAL</label>
                                                    <select 
                                                        value={jobcard.engineer_details_json?.material || '12 SQUARE'} 
                                                        onChange={e => handleEngChange('material', e.target.value)} 
                                                        className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800"
                                                    >
                                                        <optgroup label="SQUARE">
                                                            <option value="12 SQUARE">12 SQUARE</option>
                                                            <option value="15 SQUARE">15 SQUARE</option>
                                                            <option value="20 SQUARE">20 SQUARE</option>
                                                            <option value="25 SQUARE">25 SQUARE</option>
                                                            <option value="32 SQUARE">32 SQUARE</option>
                                                            <option value="50 SQUARE">50 SQUARE</option>
                                                            <option value="75 SQUARE">75 SQUARE</option>
                                                            <option value="100 SQUARE">100 SQUARE</option>
                                                        </optgroup>
                                                        <optgroup label="ROUND">
                                                            <option value="50 ROUND">50 ROUND</option>
                                                            <option value="76 ROUND">76 ROUND</option>
                                                            <option value="100 ROUND">100 ROUND</option>
                                                        </optgroup>
                                                        <optgroup label="OTHER">
                                                            <option value="BEAMS">BEAMS</option>
                                                            <option value="BAR">BAR</option>
                                                            <option value="RECTANGLE">RECTANGLE</option>
                                                            <option value="Other">Other</option>
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">THICKNESS</label>
                                                    <select 
                                                        value={jobcard.engineer_details_json?.thickness || '1,6'} 
                                                        onChange={e => handleEngChange('thickness', e.target.value)} 
                                                        className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800"
                                                    >
                                                        <option value="1,6">1,6</option>
                                                        <option value="1,2">1,2</option>
                                                        <option value="2">2</option>
                                                        <option value="3">3</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">ANGLE</label>
                                                    <select 
                                                        value={jobcard.engineer_details_json?.angles || '90'} 
                                                        onChange={e => handleEngChange('angles', e.target.value)} 
                                                        className="w-full border border-gray-300 p-1.5 focus:outline-none bg-white text-gray-800"
                                                    >
                                                        <option value="90">90</option>
                                                        <option value="45">45</option>
                                                        <option value="30">30</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">IMAGE ATTACHMENT</label>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={handleEngImageUpload} 
                                                        className="text-[10px] file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-aloe-green file:text-charcoal hover:file:bg-green-hover"
                                                    />
                                                    {jobcard.engineer_details_json?.image_path && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-green-600 font-bold">✓ Uploaded</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => openLightbox(jobcard.engineer_details_json.image_path)}
                                                                className="text-[10px] text-blue-600 hover:underline font-bold"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <DeptRow label="Outsource" name="prod_outsource" deptKey="outsource" jobcard={jobcard} handleChange={handleChange} setJobcard={setJobcard} me={me} />
                                    {jobcard.prod_outsource && (
                                        <div className="flex flex-col border-b border-gray-300 bg-purple-50/50 p-2 text-xs overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-300">
                                                        <th className="p-1 font-bold text-gray-500 uppercase">Company</th>
                                                        <th className="p-1 font-bold text-gray-500 uppercase w-28">Date Sent</th>
                                                        <th className="p-1 font-bold text-gray-500 uppercase w-28">Return Date</th>
                                                        <th className="p-1 w-8"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(Array.isArray(jobcard.outsource_details_json) && jobcard.outsource_details_json.length > 0 ? jobcard.outsource_details_json : [{ company: '', date_sent: '', return_date: '' }]).map((row: any, idx: number) => (
                                                        <tr key={idx} className="border-b border-gray-100 align-top">
                                                            <td className="p-1">
                                                                <input type="text" value={row.company || ''} onChange={e => handleOutsourceRowChange(idx, 'company', e.target.value)} placeholder="Company..." className="w-full border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                            </td>
                                                            <td className="p-1">
                                                                <input type="date" value={row.date_sent || ''} onChange={e => handleOutsourceRowChange(idx, 'date_sent', e.target.value)} className="w-full border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                            </td>
                                                            <td className="p-1">
                                                                <input type="date" value={row.return_date || ''} onChange={e => handleOutsourceRowChange(idx, 'return_date', e.target.value)} className="w-full border border-gray-300 p-1 focus:outline-none bg-white text-gray-800" />
                                                            </td>
                                                            <td className="p-1 text-center">
                                                                <button type="button" onClick={() => handleRemoveOutsourceRow(idx)} className="text-gray-300 hover:text-red-500" title="Remove">✕</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button type="button" onClick={handleAddOutsourceRow} className="mt-2 w-full py-1 border border-dashed border-gray-300 rounded text-[11px] font-medium text-gray-500 hover:border-black hover:text-black">+ Add company</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            
                            {/* Collect/Delivery Options (Header removed as requested) */}
                            <div className="border-b border-gray-300">
                                <Toggle label="Deliver" name="track_deliver" jobcard={jobcard} handleChange={handleChange} />
                                {jobcard.track_deliver && (
                                    <div className="bg-blue-50/50 pl-6 pr-3 py-2 text-sm border-b border-gray-100 flex flex-col gap-2">
                                        <textarea name="delivery_address" value={jobcard.delivery_address || ''} onChange={handleChange} placeholder="Delivery Address..." className="w-full border border-gray-300 p-1 text-xs mt-1 resize-none h-16 bg-white" />
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <label className="flex items-center gap-2"><input type="checkbox" name="deliver_car" checked={!!jobcard.deliver_car} onChange={handleChange} className="text-aloe-green" /> Car</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" name="deliver_bakkie" checked={!!jobcard.deliver_bakkie} onChange={handleChange} className="text-aloe-green" /> Bakkie</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" name="deliver_truck" checked={!!jobcard.deliver_truck} onChange={handleChange} className="text-aloe-green" /> Truck</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" name="deliver_trailer" checked={!!jobcard.deliver_trailer} onChange={handleChange} className="text-aloe-green" /> Trailer</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" name="deliver_courier" checked={!!jobcard.deliver_courier} onChange={handleChange} className="text-aloe-green" /> Courier</label>
                                        </div>
                                    </div>
                                )}
                                
                                <Toggle label="Installation" name="track_installation" jobcard={jobcard} handleChange={handleChange} />
                                {jobcard.track_installation && (
                                    <div className="bg-blue-50/50 pl-6 pr-3 py-2 text-sm border-b border-gray-100 flex flex-col gap-3">
                                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Installation address &amp; vehicles</span>
                                        <textarea name="installation_address" value={jobcard.installation_address || ''} onChange={handleChange} placeholder="Installation Address..." className="w-full border border-gray-300 p-1 text-xs mt-1 resize-none h-16 bg-white" />
                                        <div className="grid grid-cols-3 gap-2">
                                            <label className="flex items-center gap-2 text-[10px] sm:text-xs"><input type="checkbox" name="install_bakkie" checked={!!jobcard.install_bakkie} onChange={handleChange} className="text-aloe-green" /> Bakkie</label>
                                            <label className="flex items-center gap-2 text-[10px] sm:text-xs"><input type="checkbox" name="install_truck" checked={!!jobcard.install_truck} onChange={handleChange} className="text-aloe-green" /> Truck</label>
                                            <label className="flex items-center gap-2 text-[10px] sm:text-xs"><input type="checkbox" name="install_trailer" checked={!!jobcard.install_trailer} onChange={handleChange} className="text-aloe-green" /> Trailer</label>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Everyone working on site</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                                    <span>Riggers</span>
                                                    <input type="text" name="install_riggers" value={jobcard.install_riggers || ''} onChange={handleChange} className="w-12 border border-gray-300 p-0.5 text-center bg-white" />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                                    <span>Applicators</span>
                                                    <input type="text" name="install_applicators" value={jobcard.install_applicators || ''} onChange={handleChange} className="w-12 border border-gray-300 p-0.5 text-center bg-white" />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                                    <span>Builders</span>
                                                    <input type="text" name="install_builders" value={jobcard.install_builders || ''} onChange={handleChange} className="w-12 border border-gray-300 p-0.5 text-center bg-white" />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                                    <span>Minions</span>
                                                    <input type="text" name="install_minions" value={jobcard.install_minions || ''} onChange={handleChange} className="w-12 border border-gray-300 p-0.5 text-center bg-white" />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                                    <span>Drivers</span>
                                                    <input type="text" name="install_drivers" value={jobcard.install_drivers || ''} onChange={handleChange} className="w-12 border border-gray-300 p-0.5 text-center bg-white" />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                                    <span>Supervisors</span>
                                                    <input type="text" name="install_supervisors" value={jobcard.install_supervisors || ''} onChange={handleChange} className="w-12 border border-gray-300 p-0.5 text-center bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Travel (for costing)</span>
                                            <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                                <span>Distance one-way (km)</span>
                                                <input type="text" name="install_travel_km" value={jobcard.install_travel_km || ''} onChange={handleChange} className="w-16 border border-gray-300 p-0.5 text-center bg-white" />
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Tools required</span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
                                                {[
                                                    { key: 'basic', label: 'Basic' },
                                                    { key: 'applicate', label: 'Applicate' },
                                                    { key: 'electrical', label: 'Electrical' },
                                                    { key: 'special', label: 'Special' },
                                                    { key: 'set_build', label: 'Set Build' },
                                                    { key: 'generator', label: 'Generator' },
                                                    { key: 'compressor', label: 'Compressor' },
                                                    { key: 'ladders', label: 'Ladders' },
                                                    { key: 'scaffold', label: 'Scaffold' },
                                                    { key: 'cherry_picker', label: 'Cherry Picker' },
                                                ].map(tool => (
                                                    <label key={tool.key} className="flex items-center gap-2 text-[10px] sm:text-xs cursor-pointer">
                                                        <input type="checkbox" checked={!!jobcard.install_tools_json?.[tool.key]} onChange={() => handleToolToggle(tool.key)} className="text-aloe-green" /> {tool.label}
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] sm:text-xs mt-2 pt-2 border-t border-gray-100">
                                                <span>Tools total cost (R)</span>
                                                <input type="text" name="install_tools_cost" value={jobcard.install_tools_cost || ''} onChange={handleChange} className="w-20 border border-gray-300 p-0.5 text-center bg-white" />
                                            </div>
                                        </div>
                                        <div className="mt-2 border-t border-gray-200 pt-2 flex items-center gap-4 text-[11px] sm:text-xs font-bold text-gray-700">
                                            <span>Safety File Needed?</span>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={jobcard.install_safety_file === true} 
                                                    onChange={() => handleChange({ target: { name: 'install_safety_file', value: 'true', type: 'checkbox', checked: true } } as any)} 
                                                    className="text-aloe-green w-4 h-4 rounded" 
                                                />
                                                Yes
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={jobcard.install_safety_file === false} 
                                                    onChange={() => handleChange({ target: { name: 'install_safety_file', value: 'false', type: 'checkbox', checked: false } } as any)} 
                                                    className="text-aloe-green w-4 h-4 rounded" 
                                                />
                                                No
                                            </label>
                                        </div>
                                    <textarea name="install_additional" value={jobcard.install_additional || ''} onChange={handleChange} placeholder="Additional equipment..." className="w-full border border-gray-300 p-2 text-xs mt-1 resize-none h-16"></textarea>
                                    {(() => {
                                        const rows = getInstallBreakdown(jobcard, settings);
                                        return (
                                            <div className="mt-2 border-t border-gray-200 pt-2 text-xs">
                                                <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                                                    Installation cost
                                                </span>
                                                {rows.length === 0 ? (
                                                    <div className="text-gray-400 italic">No installation costs yet.</div>
                                                ) : (
                                                    <>
                                                        {rows.map((l, i) => (
                                                            <div key={i} className="flex items-center justify-between text-gray-600 py-0.5">
                                                                <span>{l.label}{l.detail ? ' — ' + l.detail : ''}</span>
                                                                <span className="font-medium">R {l.amount.toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                        <div className="flex items-center justify-end border-t border-gray-200 mt-1 pt-1">
                                                            <span className="font-bold text-gray-700">
                                                                Charge: R {computeInstallCharge(jobcard, settings).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                            
                            <Toggle label="Civil" name="mat_section_civil" jobcard={jobcard} handleChange={handleChange} />
                            {jobcard.mat_section_civil && (
                                <div className="p-3 flex flex-col gap-3 bg-blue-50/50 border-b border-gray-300">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Concrete</label>
                                        <textarea 
                                            name="mat_civil_concrete" 
                                            value={jobcard.mat_civil_concrete || ''} 
                                            onChange={handleChange} 
                                            placeholder="Concrete details..." 
                                            className="w-full border border-gray-300 p-2 text-xs focus:outline-none focus:bg-blue-50 bg-white text-gray-800 resize-none h-16"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Toolhire</label>
                                        <textarea 
                                            name="mat_civil_toolhire" 
                                            value={jobcard.mat_civil_toolhire || ''} 
                                            onChange={handleChange} 
                                            placeholder="Toolhire details..." 
                                            className="w-full border border-gray-300 p-2 text-xs focus:outline-none focus:bg-blue-50 bg-white text-gray-800 resize-none h-16"
                                        ></textarea>
                                    </div>
                                </div>
                            )}
                                
                                <Toggle label="Collect" name="track_collect" jobcard={jobcard} handleChange={handleChange} />
                            </div>


                            


                        </div>
                    </div>

                    {/* Footer Boxes */}
                    <div className="flex border border-black border-t-0 flex-wrap lg:flex-nowrap bg-gray-50">
                        {/* Invoice & Order Refs */}
                        <div className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-black text-sm">
                            <div className="flex items-center p-2 border-b border-gray-300">
                                <span className="w-20 font-bold text-gray-700">Order No:</span>
                                <input type="text" name="order_no" value={jobcard.order_no || ''} onChange={handleChange} className="flex-1 border-b border-gray-400 bg-transparent px-2 focus:outline-none focus:border-black font-medium text-gray-800" />
                            </div>
                            <div className="flex items-center p-2 border-b border-gray-300">
                                <span className="w-20 font-bold text-gray-700">Pro Inv:</span>
                                <input type="text" name="pro_inv" value={jobcard.pro_inv || ''} onChange={handleChange} className="flex-1 border-b border-gray-400 bg-transparent px-2 focus:outline-none focus:border-black font-medium text-gray-800" />
                            </div>
                            <div className="flex items-center p-2">
                                <span className="w-20 font-bold text-gray-700">Invoice:</span>
                                <input type="text" name="final_invoice" value={jobcard.final_invoice || ''} onChange={handleChange} className="flex-1 border-b border-gray-400 bg-transparent px-2 focus:outline-none focus:border-black font-medium text-gray-800" />
                            </div>
                        </div>

                        {/* Payment Checks */}
                        <div className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-black text-sm p-4 justify-start gap-4 bg-white">
                            <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <span className="font-bold uppercase w-16 text-gray-700">Deposit:</span>
                                    <input type="checkbox" name="deposit_paid" checked={!!jobcard.deposit_paid} onChange={handleChange} className="w-5 h-5 rounded border-gray-400 cursor-pointer" />
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <span className="font-bold uppercase w-16 text-gray-700">CASH:</span>
                                    <input type="checkbox" name="cash_paid" checked={!!jobcard.cash_paid} onChange={handleChange} className="w-5 h-5 rounded border-gray-400 cursor-pointer" />
                                </label>
                            </div>

                            {/* Scanned Jobcard Area */}
                            <div className="mt-auto">
                                <span className="font-bold text-gray-700 text-xs block mb-2">Scanned Jobcard:</span>
                                <div className="border border-gray-300 rounded p-3 bg-gray-50 flex items-center justify-between gap-2">
                                    {jobcard.scanned_jobcard_path ? (
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => openLightbox(jobcard.scanned_jobcard_path)} className="text-[10px] font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 rounded px-2 py-1">View</button>
                                                <button onClick={() => setJobcard((p: any) => ({ ...p, scanned_jobcard_path: null }))} className="text-[10px] font-bold border border-red-200 text-red-600 hover:bg-red-50 rounded px-2 py-1">Remove</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="w-full flex items-center justify-center border border-dashed border-gray-400 rounded p-2 text-center cursor-pointer hover:bg-gray-100">
                                            <span className="text-xs text-gray-500 font-medium">{uploadingScan ? 'Uploading...' : '+ Upload Scan'}</span>
                                            <input type="file" onChange={handleScannedUpload} className="hidden" disabled={uploadingScan} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Files Uploaded Module */}
                        <div className="w-full lg:w-1/3 p-4 flex flex-col text-sm bg-white relative">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-700">Files / Artwork Uploaded:</span>
                                <button onClick={() => setShowUploadModal(true)} className="bg-[#1a1a1a] text-white px-3 py-1 rounded text-xs font-bold hover:bg-black">+ Add Files</button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto max-h-[180px] border border-gray-200 rounded p-2 bg-gray-50 flex flex-col gap-2">
                                {Array.isArray(jobcard.files_json) && jobcard.files_json.length > 0 ? (
                                    jobcard.files_json.map((f: any, idx: number) => (
                                        <div key={idx} className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="font-bold text-xs text-gray-800 truncate flex-1">{f.displayName}</span>
                                                <button onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-600 text-[10px] font-bold shrink-0">✕</button>
                                            </div>
                                            {f.description && <p className="text-[10px] text-gray-500 mb-2 truncate">{f.description}</p>}
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => openLightbox(f.storagePath)}
                                                    className="flex-1 text-[10px] font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 rounded px-2 py-1 transition-colors"
                                                >👁 View</button>
                                                <button
                                                    onClick={() => downloadFile(f.storagePath, f.displayName)}
                                                    className="flex-1 text-[10px] font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                                                >⬇ Download</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-gray-400 italic text-xs block text-center mt-4">No files uploaded yet.</span>
                                )}
                            </div>
                            
                            {/* Simple inline notes just in case */}
                            <textarea 
                                name="files_notes" 
                                value={jobcard.files_notes || ''} 
                                onChange={handleChange} 
                                className="w-full border-t border-gray-200 bg-transparent p-2 focus:outline-none focus:ring-1 focus:ring-black resize-none h-16 mt-2"
                                placeholder="Additional files notes..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX */}
            {lightboxUrl && (() => {
                const rotation = (lightboxPath && jobcard.file_rotations_json?.[lightboxPath]) || 0;
                return (
                    <div
                        onClick={() => { setLightboxUrl(null); setLightboxPath(null); }}
                        className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4 cursor-pointer"
                    >
                        <div onClick={e => e.stopPropagation()} className="relative max-w-[90vw] max-h-[90vh]">
                            <button
                                onClick={() => { setLightboxUrl(null); setLightboxPath(null); }}
                                className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-gray-300 bg-transparent border-none cursor-pointer"
                            >✕</button>
                            <button
                                onClick={() => rotateLightbox(-90)}
                                title="Rotate left"
                                className="absolute -top-10 right-8 text-white text-2xl font-bold hover:text-gray-300 bg-transparent border-none cursor-pointer"
                            >↺</button>
                            <button
                                onClick={() => rotateLightbox(90)}
                                title="Rotate right"
                                className="absolute -top-10 right-16 text-white text-2xl font-bold hover:text-gray-300 bg-transparent border-none cursor-pointer"
                            >↻</button>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={lightboxUrl}
                                alt="File preview"
                                style={{
                                    maxWidth: rotation % 180 !== 0 ? '85vh' : '90vw',
                                    maxHeight: rotation % 180 !== 0 ? '90vw' : '85vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    transform: `rotate(${rotation}deg)`,
                                    transition: 'transform 0.2s'
                                }}
                                onError={() => {
                                    // Not an image — open in new tab instead
                                    window.open(lightboxUrl, '_blank');
                                    setLightboxUrl(null);
                                    setLightboxPath(null);
                                }}
                            />
                        </div>
                    </div>
                );
            })()}

            {/* ARTWORK UPLOAD MODAL */}
            {showUploadModal && (

                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                        <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold">✕</button>
                        <h2 className="text-2xl font-bold mb-2">Upload Files / Artwork</h2>
                        <p className="text-gray-600 mb-6 text-sm">Please provide a name, description, and file for each upload.</p>
                        
                        <form onSubmit={handleFileUpload}>
                            {uploadEntries.map((en, idx) => (
                                <div key={en.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 relative">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-sm">{idx === 0 ? 'First File' : `File ${idx + 1}`}</h3>
                                        {uploadEntries.length > 1 && (
                                            <button type="button" onClick={() => setUploadEntries(prev => prev.filter(e => e.id !== en.id))} className="text-red-500 text-xs font-bold bg-white border border-red-200 px-2 py-1 rounded">Remove</button>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-xs font-bold mb-1">File Name *</label>
                                        <input type="text" required value={en.name} onChange={e => setUploadEntries(prev => prev.map(p => p.id === en.id ? { ...p, name: e.target.value } : p))} className="w-full border p-2 rounded text-sm" placeholder="e.g. Logo Vector" />
                                    </div>
                                    <div className="mb-3" onClick={() => fileRefs.current[en.id]?.click()}>
                                        <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${en.file ? 'border-aloe-green bg-green-50' : 'border-gray-300 bg-white'}`}>
                                            {en.file ? <span className="font-bold text-sm text-aloe-green">{en.file.name}</span> : <span className="text-sm text-gray-500">Click to select file</span>}
                                            <input type="file" required ref={el => { fileRefs.current[en.id] = el; }} onChange={e => setUploadEntries(prev => prev.map(p => p.id === en.id ? { ...p, file: e.target.files?.[0] || null } : p))} className="hidden" />
                                        </div>
                                    </div>
                                    <div className="mb-1">
                                        <label className="block text-xs font-bold mb-1">Description *</label>
                                        <textarea required value={en.description} onChange={e => setUploadEntries(prev => prev.map(p => p.id === en.id ? { ...p, description: e.target.value } : p))} className="w-full border p-2 rounded text-sm resize-none" rows={2} placeholder="e.g. For print on front..." />
                                    </div>
                                </div>
                            ))}
                            
                            <button type="button" onClick={() => setUploadEntries(prev => [...prev, createEntry()])} className="w-full py-3 mb-6 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50">+ Add Another File</button>
                            
                            {uploadingFiles && (
                                <div className="mb-4">
                                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                                        <div className="h-full bg-aloe-green transition-all" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                    <p className="text-center text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowUploadModal(false)} className="px-5 py-2 text-sm font-bold border rounded-md hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={uploadingFiles} className="px-6 py-2 bg-black text-white text-sm font-bold rounded-md hover:bg-gray-800 disabled:opacity-50">
                                    {uploadingFiles ? 'Uploading...' : 'Confirm Uploads'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
