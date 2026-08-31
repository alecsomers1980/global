"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  BTN_PRIMARY,
  Card,
  EmptyState,
  FIELD,
  FIELD_LABEL,
  Notice,
  PageHeader,
  StatusPill,
} from "@/components/admin/ui";
import {
  createNewsPost,
  deleteNewsPosts,
  listNews,
  saveNewsPost,
  type AdminNewsPost,
} from "../actions";

const DELETE_BTN =
  "inline-flex min-h-[38px] items-center justify-center border border-red-700/30 bg-white px-4 text-[12px] uppercase tracking-[0.1em] text-red-800 transition-colors hover:bg-red-50 disabled:opacity-40";

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function AdminNewsPage() {
  const token = useAdminToken();
  const [posts, setPosts] = useState<AdminNewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  /**
   * The editor is controlled, so its HTML lives here rather than in the form.
   * Keyed by post id so opening a second article cannot inherit the first
   * one's body.
   */
  const [bodies, setBodies] = useState<Record<string, string>>({});

  async function load() {
    const result = await listNews(token);
    if (result.ok) {
      setPosts(result.data);
      setBodies(Object.fromEntries(result.data.map((p) => [p.id, p.body])));
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onSave(post: AdminNewsPost, form: HTMLFormElement) {
    setBusy(true);
    setError(null);
    setSaved(null);
    const fd = new FormData(form);
    const result = await saveNewsPost(token, post.id, {
      title: String(fd.get("title") ?? ""),
      excerpt: String(fd.get("excerpt") ?? ""),
      body: bodies[post.id] ?? "",
      hero_image: String(fd.get("hero_image") ?? "").trim() || null,
      published: fd.get("published") === "on",
    });
    if (result.ok) {
      setSaved(
        fd.get("published") === "on"
          ? "Saved and live on the site."
          : "Saved as a draft — nobody can see it yet."
      );
      await load();
    } else {
      setError(result.error);
    }
    setBusy(false);
  }

  async function onAdd(form: HTMLFormElement) {
    const title = String(new FormData(form).get("new_title") ?? "");
    setBusy(true);
    setError(null);
    setSaved(null);
    const result = await createNewsPost(token, title);
    if (result.ok) {
      setSaved(`Started “${title.trim()}”. Write it, then tick Publish.`);
      setAdding(false);
      await load();
      setOpenId(result.data);
    } else {
      setError(result.error);
    }
    setBusy(false);
  }

  async function onDelete(ids: string[]) {
    const names = posts.filter((p) => ids.includes(p.id)).map((p) => p.title);
    if (
      !window.confirm(
        `Delete ${names.length === 1 ? `“${names[0]}”` : `${names.length} articles`}?\n\n` +
          `${names.join("\n")}\n\nThis cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    const result = await deleteNewsPosts(token, ids);
    if (result.ok) {
      setSaved(`Deleted ${names.length} article${names.length === 1 ? "" : "s"}.`);
      setPicked(new Set());
      if (openId && ids.includes(openId)) setOpenId(null);
      await load();
    } else {
      setError(result.error);
    }
    setBusy(false);
  }

  if (loading) return <p className="text-ink-mute">Loading…</p>;

  const allPicked = posts.length > 0 && picked.size === posts.length;

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Latest news"
        description="Farm updates, harvests, new products, where to find you at a market. Articles start as drafts and only appear on the site once you tick Publish. The same wording check applies here as on the products."
        action={
          <button type="button" onClick={() => setAdding((v) => !v)} className={BTN_PRIMARY}>
            {adding ? "Cancel" : "Write an article"}
          </button>
        }
      />

      <div className="mt-8 flex flex-col gap-3">
        {error && <Notice tone="error">{error}</Notice>}
        {saved && <Notice tone="ok">{saved}</Notice>}
      </div>

      {adding && (
        <Card title="New article" className="mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAdd(e.currentTarget);
            }}
            className="flex flex-wrap items-end gap-4 px-7 py-6"
          >
            <div className="flex min-w-[280px] flex-1 flex-col gap-2">
              <label htmlFor="new_title" className={FIELD_LABEL}>
                Headline
              </label>
              <input
                id="new_title"
                name="new_title"
                autoFocus
                className={FIELD}
                placeholder="This season&rsquo;s moringa harvest"
              />
            </div>
            <button type="submit" disabled={busy} className={BTN_PRIMARY}>
              {busy ? "Starting…" : "Start writing"}
            </button>
          </form>
        </Card>
      )}

      {posts.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              checked={allPicked}
              onChange={() => setPicked(allPicked ? new Set() : new Set(posts.map((p) => p.id)))}
              className="h-4 w-4"
            />
            Select all
          </label>
          {picked.size > 0 && (
            <button type="button" onClick={() => onDelete([...picked])} disabled={busy} className={DELETE_BTN}>
              Delete {picked.size} selected
            </button>
          )}
        </div>
      )}

      {posts.length === 0 ? (
        <Card className="mt-6">
          <EmptyState message="No articles yet. The section stays off the home page until the first one is published." />
        </Card>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {posts.map((post) => {
            const open = openId === post.id;
            return (
              <Card key={post.id}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={picked.has(post.id)}
                    onChange={() =>
                      setPicked((prev) => {
                        const next = new Set(prev);
                        if (next.has(post.id)) next.delete(post.id);
                        else next.add(post.id);
                        return next;
                      })
                    }
                    aria-label={`Select ${post.title}`}
                    className="h-4 w-4 shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : post.id)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-5 text-left"
                  >
                    <span className="relative h-14 w-20 shrink-0 overflow-hidden border border-hairline bg-surface">
                      {post.hero_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.hero_image} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl text-ink">{post.title}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-mute">
                        {post.published ? `Published ${date(post.published_at)}` : "Not published"}
                      </span>
                    </span>
                    <StatusPill status={post.published ? "on the site" : "draft"} />
                    <span aria-hidden className="text-[13px] text-ink-mute">
                      {open ? "Close" : "Edit"}
                    </span>
                  </button>
                </div>

                {open && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSave(post, e.currentTarget);
                    }}
                    className="flex flex-col gap-6 border-t border-hairline px-5 py-7"
                  >
                    <ImageUpload
                      name="hero_image"
                      label="Main picture"
                      bucket="news"
                      value={post.hero_image}
                      fallback={post.hero_image}
                      fallbackNote="Shown at the top of the article and on the card."
                      className="h-32 w-48"
                    />

                    <div className="flex flex-col gap-2">
                      <label htmlFor={`title_${post.id}`} className={FIELD_LABEL}>
                        Headline
                      </label>
                      <input
                        id={`title_${post.id}`}
                        name="title"
                        defaultValue={post.title}
                        className={FIELD}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor={`excerpt_${post.id}`} className={FIELD_LABEL}>
                        Short summary
                      </label>
                      <textarea
                        id={`excerpt_${post.id}`}
                        name="excerpt"
                        rows={2}
                        defaultValue={post.excerpt ?? ""}
                        className={FIELD}
                        placeholder="One or two lines, shown on the card rather than the start of the article."
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className={FIELD_LABEL}>The article</span>
                      <RichTextEditor
                        value={bodies[post.id] ?? ""}
                        onChange={(html) => setBodies((b) => ({ ...b, [post.id]: html }))}
                      />
                    </div>

                    <label className="flex items-center gap-2 text-[14px] text-ink-soft">
                      <input
                        type="checkbox"
                        name="published"
                        defaultChecked={post.published}
                        className="h-4 w-4"
                      />
                      Publish this article on the site
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <button type="submit" disabled={busy} className={BTN_PRIMARY}>
                        {busy ? "Saving…" : "Save article"}
                      </button>
                      {post.published && (
                        <a
                          href={`/news/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[14px] text-ink-soft underline hover:text-brand"
                        >
                          View it on the site
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete([post.id])}
                        disabled={busy}
                        className={`${DELETE_BTN} ml-auto`}
                      >
                        Delete this article
                      </button>
                    </div>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
