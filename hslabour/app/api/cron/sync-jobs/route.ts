import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  revalidatePath("/jobs");

  return Response.json({ revalidated: true, at: Date.now() });
}