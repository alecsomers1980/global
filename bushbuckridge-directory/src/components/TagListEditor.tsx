'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TagListEditorProps {
  value: string[] | null | undefined;
  onChange: (tags: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

export default function TagListEditor({
  value,
  onChange,
  placeholder = "Add and press Enter",
  addLabel = "Add",
}: TagListEditorProps) {
  const [input, setInput] = useState('');
  const tags = value ?? [];

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="h-11 rounded-xl border border-primary/10 bg-white/50 px-3 text-sm flex-1"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <button
          type="button"
          className="h-11 px-4 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
          onClick={addTag}
        >
          {addLabel}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 text-primary text-sm font-bold pl-3 pr-2 py-1"
          >
            {tag}
            <button
              type="button"
              className="text-primary/50 hover:text-red-500"
              onClick={() => removeTag(index)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}