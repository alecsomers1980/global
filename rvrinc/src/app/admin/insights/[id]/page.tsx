import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image from "next/image";

async function updatePost(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const excerpt = formData.get("excerpt") as string;
  const meta_title = formData.get("meta_title") as string;
  const meta_description = formData.get("meta_description") as string;
  const content = formData.get("content") as string;

  const { error } = await supabase
    .from("insights_posts")
    .update({ title, slug, excerpt, meta_title, meta_description, content })
    .eq("id", id);

  if (error) {
    console.error("Update failed:", error.message);
    return;
  }

  revalidatePath("/admin/insights");
  redirect("/admin/insights");
}

async function approvePost(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("insights_posts")
    .update({ status: "APPROVED" })
    .eq("id", id);

  if (error) {
    console.error("Approve failed:", error.message);
    return;
  }

  revalidatePath("/admin/insights");
  redirect("/admin/insights");
}

async function discardPost(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("insights_posts")
    .update({ status: "DISCARDED" })
    .eq("id", id);

  if (error) {
    console.error("Discard failed:", error.message);
    return;
  }

  revalidatePath("/admin/insights");
  redirect("/admin/insights");
}

export default async function AdminInsightDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("insights_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    return (
      <div className="p-8 text-center text-red-600">Post not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Insight</h1>

      {post.image_url && (
        <div className="relative w-full h-64 rounded-xl overflow-hidden">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <form className="bg-white rounded-xl border p-6 space-y-5">
        <input type="hidden" name="id" value={post.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            name="title"
            defaultValue={post.title}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            name="slug"
            defaultValue={post.slug}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea
            name="excerpt"
            defaultValue={post.excerpt || ""}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
          <input
            name="meta_title"
            defaultValue={post.meta_title || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea
            name="meta_description"
            defaultValue={post.meta_description || ""}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
          <textarea
            name="content"
            defaultValue={post.content || ""}
            rows={16}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button variant="brand" size="sm" type="submit" formAction={updatePost}>
            Save Changes
          </Button>
          <Button variant="outline" size="sm" type="submit" formAction={approvePost}>
            Approve for Publishing
          </Button>
          <Button variant="destructive" size="sm" type="submit" formAction={discardPost}>
            Discard
          </Button>
        </div>
      </form>
    </div>
  );
}
