'use client';
import { useState, useEffect, useCallback, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { createClientSupabase } from '@/lib/supabase';

const MATERIALS = ['ContraVision', 'PVC', 'Wallpaper', 'Cast', 'Polymeric', 'Monomeric', 'Air Release', 'Lightbox', 'Other'];
const STATUSES = ['Quoted', 'Approved', 'In Production', 'On Hold', 'Completed'];

interface FileEntry { id: string; file: File | null; name: string; description: string; }
function createEntry(): FileEntry { return { id: Math.random().toString(36).slice(2), file: null, name: '', description: '' }; }

export default function JobcardEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    
    const [jobcard, setJobcard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadEntries, setUploadEntries] = useState<FileEntry[]>([createEntry()]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/portal/admin/jobcards/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobcard),
            });
            alert('Jobcard saved!');
        } catch (e) {
            console.error(e);
            alert('Failed to save.');
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
        if (url) setLightboxUrl(url);
        else alert('Could not load file. Please check the storage bucket.');
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">Loading...</div>;
    if (!jobcard) return <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">Not Found</div>;

    const InputLine = ({ label, name }: { label: string; name: string }) => (
        <div className="flex border-b border-gray-300">
            <span className="w-24 uppercase text-[10px] text-gray-500 font-bold py-2 px-2 border-r border-gray-300 flex items-center bg-gray-50">{label}</span>
            <input type="text" name={name} value={jobcard[name] || ''} onChange={handleChange} className="flex-1 py-1 px-3 text-sm focus:outline-none focus:bg-blue-50 bg-transparent font-medium text-gray-800" />
        </div>
    );

    const Toggle = ({ label, name }: { label: string; name: string }) => (
        <label className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <input type="checkbox" name={name} checked={!!jobcard[name]} onChange={handleChange} className="w-4 h-4 text-aloe-green/80 rounded border-gray-300 focus:ring-aloe-green cursor-pointer" />
        </label>
    );

    return (
        <div className="min-h-[100dvh] bg-gray-200 p-4 md:p-8 font-outfit">
            <div className="max-w-[1000px] mx-auto">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <Link href="/portal/admin/jobcards" className="text-gray-500 hover:text-gray-800 font-medium">← Back to Jobcards</Link>
                    <div className="flex gap-4">
                        <select 
                            name="status" 
                            value={jobcard.status || 'Quoted'} 
                            onChange={handleChange}
                            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-bold shadow-sm outline-none w-40"
                        >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={handleDelete} disabled={deleting} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md font-bold shadow-sm hover:bg-red-100 disabled:opacity-50">
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button onClick={handleSave} disabled={saving} className="bg-[#1a1a1a] text-white px-6 py-2 rounded-md font-bold shadow-md hover:bg-black disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Jobcard'}
                        </button>
                    </div>
                </div>

                {/* Jobcard Container (Paper look simulation) */}
                <div className="bg-white shadow-xl max-w-[1000px] mx-auto border border-gray-300 p-8 text-gray-900" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px)', backgroundSize: '100% 40px' }}>
                    
                    {/* Header Layout */}
                    <div className="flex border border-black mb-6 flex-wrap lg:flex-nowrap">
                        {/* Logo Box */}
                        <div className="w-full lg:w-48 border-b lg:border-b-0 lg:border-r border-black p-4 flex flex-col items-center justify-center bg-gray-50">
                            <Image src="/aloe-logo.png" alt="Aloe Signs" width={120} height={40} className="object-contain" priority />
                            <p className="text-[9px] tracking-widest uppercase mt-2 font-bold text-gray-600">Create Manufacture Install</p>
                        </div>

                        {/* Middle Info */}
                        <div className="w-full lg:w-[40%] border-b lg:border-b-0 lg:border-r border-black flex flex-col">
                            <InputLine label="Invoice:" name="invoice" />
                            <div className="flex border-b border-gray-300">
                                <span className="w-24 uppercase text-[10px] text-gray-500 font-bold py-2 px-2 border-r border-gray-300 flex items-start bg-gray-50">Address:</span>
                                <textarea name="address" value={jobcard.address || ''} onChange={handleChange} className="flex-1 py-1 px-3 text-sm focus:outline-none focus:bg-blue-50 bg-transparent font-medium resize-none text-gray-800" rows={2} />
                            </div>
                            <InputLine label="Email:" name="email" />
                        </div>

                        {/* Right Info */}
                        <div className="w-full lg:w-[40%] flex flex-col">
                            <InputLine label="Company:" name="company" />
                            <InputLine label="Contact:" name="contact_name" />
                            <InputLine label="Tel:" name="contact_phone" />
                        </div>
                        
                        {/* Entry box */}
                        <div className="w-full lg:w-32 border-t lg:border-t-0 lg:border-l border-black flex flex-col">
                            <div className="p-2 border-b border-gray-300 flex-1 bg-gray-50">
                                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Entry #</span>
                                <input type="text" name="entry_number" value={jobcard.entry_number || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 p-1 text-sm focus:outline-none" />
                            </div>
                            <div className="p-2 flex-1 bg-gray-50">
                                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Date:</span>
                                <input type="text" name="date" value={jobcard.date || ''} onChange={handleChange} className="w-full bg-white border border-gray-300 p-1 text-sm focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Main Grid Area */}
                    <div className="flex border border-black min-h-[500px] flex-wrap lg:flex-nowrap">
                        {/* Design Canvas/Notes */}
                        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-black flex flex-col relative bg-[#f8fafc]">
                            <div className="p-2 border-b border-gray-200 bg-white">
                                <span className="text-xs font-bold text-gray-600 uppercase">Design Canvas / Instructions</span>
                            </div>
                            <textarea 
                                name="design_notes" 
                                value={jobcard.design_notes || ''} 
                                onChange={handleChange}
                                placeholder="Paste design notes, instructions, sizes, or artwork links here..."
                                className="flex-1 w-full bg-transparent p-4 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-aloe-green/20 text-sm h-full"
                                style={{
                                    backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                                    backgroundSize: '20px 20px',
                                    lineHeight: '20px'
                                }}
                            />
                        </div>

                        {/* Toggles & Checklists */}
                        <div className="w-full lg:w-96 flex flex-col bg-white">
                            {/* Department Section */}
                            <div className="border-b border-gray-300">
                                <div className="p-2 bg-gray-100 border-b border-gray-300">
                                    <span className="text-xs font-bold text-gray-700 uppercase">Department</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2">
                                    <Toggle label="FlatBed" name="prod_flatbed" />
                                    <Toggle label="Digital" name="prod_digital" />
                                    <Toggle label="Vinyl cut" name="prod_vinyl_cut" />
                                    <Toggle label="Screen" name="prod_screen" />
                                    <Toggle label="Application" name="prod_applicate" />
                                    <Toggle label="Engineer" name="prod_engineer" />
                                    <Toggle label="Outsource" name="prod_outsource" />
                                </div>
                            </div>
                            
                            {/* Collect/Delivery Section */}
                            <div className="border-b border-gray-300">
                                <div className="p-2 bg-gray-100 border-b border-gray-300">
                                    <span className="text-xs font-bold text-gray-700 uppercase">Collect / Delivery</span>
                                </div>
                                <Toggle label="Deliver" name="track_deliver" />
                                {jobcard.track_deliver && (
                                    <div className="bg-blue-50/50 pl-6 pr-3 py-2 text-sm border-b border-gray-100 grid grid-cols-3 gap-2">
                                        <label className="flex items-center gap-2"><input type="checkbox" name="deliver_bakkie" checked={!!jobcard.deliver_bakkie} onChange={handleChange} className="text-aloe-green" /> Bakkie</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="deliver_truck" checked={!!jobcard.deliver_truck} onChange={handleChange} className="text-aloe-green" /> Truck</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="deliver_trailer" checked={!!jobcard.deliver_trailer} onChange={handleChange} className="text-aloe-green" /> Trailer</label>
                                    </div>
                                )}
                                
                                <Toggle label="Installation" name="track_installation" />
                                {jobcard.track_installation && (
                                    <div className="bg-blue-50/50 pl-6 pr-3 py-2 text-sm border-b border-gray-100 flex flex-col gap-2">
                                        <div className="grid grid-cols-3 gap-2">
                                            <label className="flex items-center gap-2"><input type="checkbox" name="install_generator" checked={!!jobcard.install_generator} onChange={handleChange} className="text-aloe-green" /> Generator</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" name="install_welder" checked={!!jobcard.install_welder} onChange={handleChange} className="text-aloe-green" /> Welder</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" name="install_shovels" checked={!!jobcard.install_shovels} onChange={handleChange} className="text-aloe-green" /> Shovels</label>
                                        </div>
                                        <input type="text" name="install_additional" value={jobcard.install_additional || ''} onChange={handleChange} placeholder="Additional equipment..." className="w-full border border-gray-300 p-1 text-xs mt-1" />
                                    </div>
                                )}
                                
                                <Toggle label="Courier" name="track_courier" />
                                <Toggle label="Collect" name="track_collect" />
                            </div>

                            {/* Status Section */}
                            <div className="border-b border-gray-300">
                                <div className="p-2 bg-gray-100 border-b border-gray-300">
                                    <span className="text-xs font-bold text-gray-700 uppercase">Status</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2">
                                    <Toggle label="On Hold" name="track_on_hold" />
                                    <Toggle label="Quoted" name="track_quote" />
                                    <Toggle label="Approved" name="track_approved" />
                                    <Toggle label="Purchase order" name="track_purchase_order" />
                                    <Toggle label="Completed" name="track_complete" />
                                </div>
                                <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Compiled by:</span>
                                    <input type="text" name="compiled_by" value={jobcard.compiled_by || ''} onChange={handleChange} className="w-32 text-sm border border-gray-300 p-0.5 px-1 focus:outline-none" />
                                </div>
                                <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Complete by:</span>
                                    <input type="text" name="track_complete_by" value={jobcard.track_complete_by || ''} onChange={handleChange} className="w-32 text-sm border border-gray-300 p-0.5 px-1 bg-yellow-50 focus:outline-none" />
                                </div>
                            </div>
                            
                            {/* Materials Section */}
                            <div className="border-b border-gray-300 h-full">
                                <div className="p-2 bg-gray-100 border-b border-gray-300">
                                    <span className="text-xs font-bold text-gray-700 uppercase">Materials</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 pb-2">
                                    {MATERIALS.map(m => (
                                        <label key={m} className="flex items-center justify-between px-3 py-1 hover:bg-gray-50 cursor-pointer">
                                            <span className="text-sm font-medium text-gray-700">{m}</span>
                                            <input type="checkbox" checked={Array.isArray(jobcard.materials_json) && jobcard.materials_json.includes(m)} onChange={() => handleMaterialToggle(m)} className="w-4 h-4 text-aloe-green/80 rounded border-gray-300 cursor-pointer" />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Financials embedded bottom left logic */}
                            <div className="mt-auto bg-gray-50 flex flex-col border-t border-black">
                                <div className="flex border-b border-gray-300">
                                    <span className="w-24 text-xs font-bold p-2">Sub Total</span>
                                    <input type="number" step="0.01" name="sub_total" value={jobcard.sub_total || ''} onChange={handleChange} className="flex-1 w-full bg-white px-2 focus:outline-none focus:bg-blue-50" />
                                </div>
                                <div className="flex border-b border-gray-300">
                                    <span className="w-24 text-xs font-bold p-2">15% VAT</span>
                                    <input type="number" step="0.01" name="vat_total" value={jobcard.vat_total || ''} onChange={handleChange} className="flex-1 w-full bg-white px-2 focus:outline-none focus:bg-blue-50" />
                                </div>
                                <div className="flex border-b border-black">
                                    <span className="w-24 text-xs font-bold p-2 bg-gray-100">Total</span>
                                    <input type="number" step="0.01" name="total" value={jobcard.total || ''} onChange={handleChange} className="flex-1 w-full font-bold bg-white px-2 focus:outline-none focus:bg-blue-50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Boxes */}
                    <div className="flex border border-black border-t-0 flex-wrap lg:flex-nowrap bg-gray-50">
                        {/* Invoice & Order Refs */}
                        <div className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-black text-sm">
                            <div className="flex items-center p-2 border-b border-gray-300">
                                <span className="w-20 font-bold text-gray-700">Order No:</span>
                                <input type="text" name="order_no" value={jobcard.order_no || ''} onChange={handleChange} className="flex-1 border-b border-gray-400 bg-transparent px-2 focus:outline-none focus:border-black font-medium" />
                            </div>
                            <div className="flex items-center p-2 border-b border-gray-300">
                                <span className="w-20 font-bold text-gray-700">Pro Inv:</span>
                                <input type="text" name="pro_inv" value={jobcard.pro_inv || ''} onChange={handleChange} className="flex-1 border-b border-gray-400 bg-transparent px-2 focus:outline-none focus:border-black font-medium" />
                            </div>
                            <div className="flex items-center p-2">
                                <span className="w-20 font-bold text-gray-700">Invoice:</span>
                                <input type="text" name="final_invoice" value={jobcard.final_invoice || ''} onChange={handleChange} className="flex-1 border-b border-gray-400 bg-transparent px-2 focus:outline-none focus:border-black font-medium" />
                            </div>
                        </div>

                        {/* Payment Checks */}
                        <div className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-black text-sm p-4 justify-start gap-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="font-bold uppercase w-16 text-gray-700">Deposit:</span>
                                <input type="checkbox" name="deposit_paid" checked={!!jobcard.deposit_paid} onChange={handleChange} className="w-5 h-5 rounded border-gray-400 cursor-pointer" />
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="font-bold uppercase w-16 text-gray-700">CASH:</span>
                                <input type="checkbox" name="cash_paid" checked={!!jobcard.cash_paid} onChange={handleChange} className="w-5 h-5 rounded border-gray-400 cursor-pointer" />
                            </label>
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
            {lightboxUrl && (
                <div
                    onClick={() => setLightboxUrl(null)}
                    className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4 cursor-pointer"
                >
                    <div onClick={e => e.stopPropagation()} className="relative max-w-[90vw] max-h-[90vh]">
                        <button
                            onClick={() => setLightboxUrl(null)}
                            className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-gray-300 bg-transparent border-none cursor-pointer"
                        >✕</button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lightboxUrl}
                            alt="File preview"
                            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }}
                            onError={() => {
                                // Not an image — open in new tab instead
                                window.open(lightboxUrl, '_blank');
                                setLightboxUrl(null);
                            }}
                        />
                    </div>
                </div>
            )}

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
