'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';

interface PairListEditorProps {
  value: Record<string, string>[] | null | undefined;
  onChange: (rows: Record<string, string>[]) => void;
  field1: { key: string; label: string; placeholder?: string };
  field2: { key: string; label: string; placeholder?: string };
  addLabel?: string;
  field2Multiline?: boolean;
}

export default function PairListEditor({
  value,
  onChange,
  field1,
  field2,
  addLabel = 'Add item',
  field2Multiline = false,
}: PairListEditorProps) {
  const rows = value ?? [];

  const handleChange = (index: number, field: string, fieldValue: string) => {
    const newRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: fieldValue } : row
    );
    onChange(newRows);
  };

  const handleRemove = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    onChange(newRows);
  };

  const handleAdd = () => {
    const newRow = { [field1.key]: '', [field2.key]: '' };
    onChange([...rows, newRow]);
  };

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="flex gap-3 items-start">
          <input
            type="text"
            placeholder={field1.placeholder || field1.label}
            value={row[field1.key] || ''}
            onChange={(e) => handleChange(index, field1.key, e.target.value)}
            className="h-11 rounded-xl border border-primary/10 bg-white/50 px-3 text-sm flex-1"
          />
          {field2Multiline ? (
            <textarea
              placeholder={field2.placeholder || field2.label}
              value={row[field2.key] || ''}
              onChange={(e) => handleChange(index, field2.key, e.target.value)}
              rows={2}
              className="rounded-xl border border-primary/10 bg-white/50 px-3 py-2 text-sm flex-[2] resize-none"
            />
          ) : (
            <input
              type="text"
              placeholder={field2.placeholder || field2.label}
              value={row[field2.key] || ''}
              onChange={(e) => handleChange(index, field2.key, e.target.value)}
              className="h-11 rounded-xl border border-primary/10 bg-white/50 px-3 text-sm flex-[2]"
            />
          )}
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}