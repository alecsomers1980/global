"use client";

import { useState, useEffect, useRef } from "react";
import { getPackages, addPackage, updatePackage, deletePackage, generateSlug } from "@/lib/packages";
import Button from "@/components/admin/ui/Button";
import Card from "@/components/admin/ui/Card";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput, { inputClass } from "@/components/admin/ui/TextInput";

const CATEGORIES = ["Safari", "Adventure", "Romantic", "Family", "Dining", "Custom"];

const emptyForm = {
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  category: "Safari",
  price: "",
  duration: "",
  maxGuests: "",
  includes: [""],
  image: "",
  tag: "",
  active: true,
};

function PackageForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const fileRef = useRef(null);

  const update = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "title" && !initial ? { slug: generateSlug(value) } : {}),
    }));

  const updateInclude = (index, value) => {
    const newIncludes = [...form.includes];
    newIncludes[index] = value;
    setForm((prev) => ({ ...prev, includes: newIncludes }));
  };

  const addInclude = () => setForm((prev) => ({ ...prev, includes: [...prev.includes, ""] }));
  const removeInclude = (index) =>
    setForm((prev) => ({ ...prev, includes: prev.includes.filter((_, i) => i !== index) }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update("image", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: form.price ? Number(form.price) : null,
      maxGuests: form.maxGuests ? Number(form.maxGuests) : null,
      includes: form.includes.filter((i) => i.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Package Name *</FieldLabel>
          <TextInput required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Sunrise Safari Escape" />
        </div>
        <div>
          <FieldLabel>URL Slug</FieldLabel>
          <TextInput value={form.slug} onChange={(e) => update("slug", e.target.value)} className="text-white/60" placeholder="auto-generated-from-title" />
        </div>
      </div>
      <div>
        <FieldLabel>Short Description *</FieldLabel>
        <TextInput required value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} placeholder="Brief tagline for cards" />
      </div>
      <div>
        <FieldLabel>Full Description</FieldLabel>
        <textarea rows={4} value={form.fullDescription} onChange={(e) => update("fullDescription", e.target.value)} className={`${inputClass} resize-y`} placeholder="Detailed description for the detail page" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <FieldLabel>Category</FieldLabel>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div>
          <FieldLabel>Price (ZAR)</FieldLabel>
          <TextInput type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="2500" />
        </div>
        <div>
          <FieldLabel>Duration</FieldLabel>
          <TextInput value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="2 Nights / 3 Days" />
        </div>
        <div>
          <FieldLabel>Max Guests</FieldLabel>
          <TextInput type="number" value={form.maxGuests} onChange={(e) => update("maxGuests", e.target.value)} placeholder="4" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Tag / Badge</FieldLabel>
          <TextInput value={form.tag || ""} onChange={(e) => update("tag", e.target.value || null)} placeholder="e.g. MOST POPULAR, NEW (leave blank for none)" />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} className="w-5 h-5 rounded accent-[#C07750]" />
            <span className="text-white/70 text-sm">Active (visible on website)</span>
          </label>
        </div>
      </div>
      <div>
        <FieldLabel>What&apos;s Included</FieldLabel>
        <div className="space-y-2">
          {form.includes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <TextInput value={item} onChange={(e) => updateInclude(i, e.target.value)} className="flex-1 px-4 py-2.5 text-sm" placeholder={`Item ${i + 1}`} />
              {form.includes.length > 1 && (
                <Button type="button" variant="danger" onClick={() => removeInclude(i)}>✕</Button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addInclude} className="mt-2 text-[#C07750] text-sm font-medium hover:text-[#C07750]/80 transition-colors">+ Add item</button>
      </div>
      <div>
        <FieldLabel>Image</FieldLabel>
        <div className="flex items-start gap-4">
          {form.image && (<img src={form.image} alt="Preview" className="w-28 h-20 object-cover rounded-lg border border-white/10" />)}
          <div className="flex-1">
            <TextInput value={form.image?.startsWith("data:") ? "" : form.image || ""} onChange={(e) => update("image", e.target.value)} className="py-2.5 text-sm mb-2" placeholder="/images/accommodation/IMG_8185.jpg" />
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-[#C07750] hover:text-[#C07750]/80 transition-colors">or upload an image file</button>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t border-white/5">
        <Button type="submit">{initial ? "UPDATE PACKAGE" : "CREATE PACKAGE"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function PackagesManager() {
  const [packages, setPackages] = useState([]);
  const [view, setView] = useState("list");
  const [editPkg, setEditPkg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { refreshPackages(); }, []);

  const refreshPackages = () => { getPackages().then(setPackages).catch((err) => console.error("Failed to load packages:", err)); };
  const handleCreate = async (data) => { try { await addPackage(data); refreshPackages(); setView("list"); } catch (err) { console.error("Failed to create package:", err); } };
  const handleUpdate = async (data) => { try { await updatePackage(editPkg.id, data); refreshPackages(); setEditPkg(null); setView("list"); } catch (err) { console.error("Failed to update package:", err); } };
  const handleDelete = async (id) => { try { await deletePackage(id); refreshPackages(); setDeleteConfirm(null); } catch (err) { console.error("Failed to delete package:", err); } };

  return (
    <>
      {(view === "create" || view === "edit") && (
        <Card className="mb-10">
          <h2 className="text-white text-xl font-serif mb-6">{view === "create" ? "Create New Package" : `Edit: ${editPkg?.title}`}</h2>
          <PackageForm
            initial={view === "edit" ? { ...editPkg, price: editPkg?.price?.toString() || "", duration: editPkg?.duration || "", maxGuests: editPkg?.maxGuests?.toString() || "", includes: editPkg?.includes?.length > 0 ? editPkg.includes : [""], tag: editPkg?.tag || "" } : null}
            onSave={view === "create" ? handleCreate : handleUpdate}
            onCancel={() => { setView("list"); setEditPkg(null); }}
          />
        </Card>
      )}
      {view === "list" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/40 text-sm">{packages.length} package{packages.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => setView("create")}>+ NEW PACKAGE</Button>
          </div>
          <div className="space-y-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} padding="p-5" className="flex flex-col md:flex-row items-start md:items-center gap-5">
                {pkg.image && (<img src={pkg.image} alt={pkg.title} className="w-full md:w-32 h-24 object-cover rounded-lg flex-shrink-0" />)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium text-base truncate">{pkg.title}</h3>
                    {pkg.tag && (<span className="bg-[#C07750]/20 text-[#C07750] text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase flex-shrink-0">{pkg.tag}</span>)}
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase flex-shrink-0 ${pkg.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{pkg.active ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="text-white/40 text-sm truncate">{pkg.shortDescription}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/25">
                    {pkg.price && <span>R{pkg.price.toLocaleString()} pp</span>}
                    {pkg.duration && <span>{pkg.duration}</span>}
                    {pkg.category && <span>{pkg.category}</span>}
                    <span>/packages/{pkg.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={`/packages/${pkg.slug}`} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 p-2 transition-colors" title="View on site">↗</a>
                  <button onClick={() => { setEditPkg(pkg); setView("edit"); }} className="text-white/20 hover:text-[#C07750] p-2 transition-colors" title="Edit">✎</button>
                  <button onClick={() => setDeleteConfirm(pkg.id)} className="text-white/20 hover:text-red-400 p-2 transition-colors" title="Delete">✕</button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="max-w-sm mx-4" padding="p-8">
            <h3 className="text-white text-lg font-serif mb-3">Delete Package?</h3>
            <p className="text-white/50 text-sm mb-6">This action cannot be undone. The package will be permanently removed.</p>
            <div className="flex gap-3">
              <Button onClick={() => handleDelete(deleteConfirm)} variant="dangerFilled">DELETE</Button>
              <Button onClick={() => setDeleteConfirm(null)} variant="secondary">Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
