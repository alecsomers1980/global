import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image from "next/image";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminBlogEditorPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border bg-white p-12 text-center text-muted">
          Post not found.
        </div>
      </div>
    );
  }

  const defaultScheduled = post.scheduled_for
    ? new Date(post.scheduled_for).toISOString().slice(0, 16)
    : "";

  // Server actions
  async function updatePost(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const postId = formData.get("id") as string;
    const scheduledValue = formData.get("scheduled_for") as string;
    const scheduledISO = scheduledValue
      ? new Date(scheduledValue).toISOString()
      : null;

    const payload = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      meta_title: formData.get("meta_title") as string,
      meta_description: formData.get("meta_description") as string,
      content: formData.get("content") as string,
      image_url: formData.get("image_url") as string,
      category: formData.get("category") as string,
      scheduled_for: scheduledISO,
    };

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("id", postId);

    if (updateError) {
      console.error("Update failed:", updateError);
      throw new Error("Failed to update post.");
    }

    revalidatePath("/admin/blog");
    redirect("/admin/blog");
  }

  async function approvePost(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const postId = formData.get("id") as string;
    const { error } = await supabase
      .from("blog_posts")
      .update({ status: "approved" })
      .eq("id", postId);

    if (error) {
      console.error("Approve failed:", error);
      throw new Error("Failed to approve post.");
    }

    revalidatePath("/admin/blog");
    redirect("/admin/blog");
  }

  async function discardPost(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const postId = formData.get("id") as string;
    const { error } = await supabase
      .from("blog_posts")
      .update({ status: "discarded" })
      .eq("id", postId);

    if (error) {
      console.error("Discard failed:", error);
      throw new Error("Failed to discard post.");
    }

    revalidatePath("/admin/blog");
    redirect("/admin/blog");
  }

  async function deletePost(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const postId = formData.get("id") as string;
    const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

    if (error) {
      console.error("Delete failed:", error);
      throw new Error("Failed to delete post.");
    }

    revalidatePath("/admin/blog");
    redirect("/admin/blog");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest">Edit Post</h1>
        <p className="text-sm text-muted">
          Status:{" "}
          <span className="font-medium capitalize">{post.status}</span>
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <form className="space-y-5">
          <input type="hidden" name="id" value={post.id} />

          {/* Current image */}
          {post.image_url ? (
            <div className="relative h-40 w-full overflow-hidden rounded-lg border">
              <Image
                src={post.image_url}
                alt="Current image"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 p-8 text-center text-xs text-muted">
              No image set.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="block text-sm font-medium">Title</span>
              <input
                name="title"
                defaultValue={post.title}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </label>
            <label>
              <span className="block text-sm font-medium">Slug</span>
              <input
                name="slug"
                defaultValue={post.slug}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="block text-sm font-medium">Category</span>
              <input
                name="category"
                defaultValue={post.category}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label>
              <span className="block text-sm font-medium">Image URL</span>
              <input
                name="image_url"
                defaultValue={post.image_url || ""}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="/images/flowers/..."
              />
            </label>
          </div>

          <label>
            <span className="block text-sm font-medium">Excerpt</span>
            <textarea
              name="excerpt"
              rows={2}
              defaultValue={post.excerpt || ""}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="block text-sm font-medium">Meta Title</span>
              <input
                name="meta_title"
                defaultValue={post.meta_title || ""}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label>
              <span className="block text-sm font-medium">Meta Description</span>
              <textarea
                name="meta_description"
                rows={2}
                defaultValue={post.meta_description || ""}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label>
            <span className="block text-sm font-medium">Content (Markdown)</span>
            <textarea
              name="content"
              rows={16}
              defaultValue={post.content || ""}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
            />
          </label>

          <label>
            <span className="block text-sm font-medium">
              Scheduled For <span className="text-muted">(optional)</span>
            </span>
            <input
              type="datetime-local"
              name="scheduled_for"
              defaultValue={defaultScheduled}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <button
              type="submit"
              formAction={updatePost}
              className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest/90"
            >
              Save changes
            </button>
            {post.status === "draft" && (
              <button
                type="submit"
                formAction={approvePost}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-forest hover:bg-gray-50"
              >
                Approve for publishing
              </button>
            )}
            {post.status !== "discarded" && (
              <button
                type="submit"
                formAction={discardPost}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Discard
              </button>
            )}
            <ConfirmSubmitButton
              action={deletePost}
              confirmText="Permanently delete this post? This cannot be undone."
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 sm:ml-auto"
            >
              Delete
            </ConfirmSubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
