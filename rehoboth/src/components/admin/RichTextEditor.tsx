"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";
import {
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { useAdminToken } from "@/app/admin/AdminGate";
import { uploadNewsImage } from "@/app/admin/actions";
import { shrinkForUpload } from "@/lib/image-resize";

/**
 * Tiptap's stock Image node stores only src, alt and title, so alignment and
 * intrinsic size would be dropped the moment an article was saved and reopened.
 */
const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "full",
        parseHTML: (el) => el.getAttribute("data-align") || "full",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
    };
  },
});

function ToolButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-9 w-9 items-center justify-center transition-colors disabled:opacity-30 ${
        active ? "bg-brand text-brand-ink" : "text-ink-soft hover:bg-brand-wash hover:text-brand-night"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const token = useAdminToken();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tiptap keeps which marks are active in its own state, not in React's, so
  // the toolbar would never re-render to show Bold as on without this.
  const [, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      ArticleImage.configure({ HTMLAttributes: { loading: "lazy", decoding: "async" } }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onTransaction: () => setTick((t) => t + 1),
    editorProps: {
      attributes: {
        class: "reh-prose min-h-[320px] max-w-none px-4 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  async function insertImage(file: File) {
    if (!editor) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", await shrinkForUpload(file));
      const result = await uploadNewsImage(token, form);
      if (!result.ok) throw new Error(result.error);
      editor.chain().focus().setImage({ src: result.data }).run();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo did not upload.");
    } finally {
      setUploading(false);
    }
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function setAlt() {
    if (!editor) return;
    const current = (editor.getAttributes("image").alt as string) || "";
    const alt = window.prompt(
      "Describe this picture, for people using a screen reader and for Google",
      current
    );
    if (alt === null) return;
    editor.chain().focus().updateAttributes("image", { alt }).run();
  }

  if (!editor) return null;

  const onImage = editor.isActive("image");

  return (
    <div className="border border-hairline bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-hairline bg-ground px-2 py-1.5">
        <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolButton>
        <ToolButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </ToolButton>
        <ToolButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={16} />
        </ToolButton>
        <ToolButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon size={16} />
        </ToolButton>

        <span className="mx-1 h-6 w-px bg-hairline" />

        <ToolButton label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton label="Smaller heading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </ToolButton>
        <ToolButton label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolButton>
        <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolButton>
        <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </ToolButton>

        <span className="mx-1 h-6 w-px bg-hairline" />

        <ToolButton label="Add a picture" disabled={uploading} onClick={() => fileInput.current?.click()}>
          <ImageIcon size={16} />
        </ToolButton>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) insertImage(file);
            // Reset, or picking the same file twice in a row fires nothing.
            e.target.value = "";
          }}
        />

        {onImage && (
          <>
            <ToolButton label="Picture on the left" active={editor.getAttributes("image").align === "left"} onClick={() => editor.chain().focus().updateAttributes("image", { align: "left" }).run()}>
              <AlignLeft size={16} />
            </ToolButton>
            <ToolButton label="Picture full width" active={editor.getAttributes("image").align === "full"} onClick={() => editor.chain().focus().updateAttributes("image", { align: "full" }).run()}>
              <AlignJustify size={16} />
            </ToolButton>
            <ToolButton label="Picture on the right" active={editor.getAttributes("image").align === "right"} onClick={() => editor.chain().focus().updateAttributes("image", { align: "right" }).run()}>
              <AlignRight size={16} />
            </ToolButton>
            <ToolButton label="Describe this picture" onClick={setAlt}>
              <Type size={16} />
            </ToolButton>
          </>
        )}

        <span className="mx-1 h-6 w-px bg-hairline" />

        <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={16} />
        </ToolButton>
        <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={16} />
        </ToolButton>

        {uploading && <span className="ml-2 text-[13px] text-brand">Adding the picture…</span>}
        {error && <span className="ml-2 text-[13px] text-red-800">{error}</span>}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
