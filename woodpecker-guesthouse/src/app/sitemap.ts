import type { MetadataRoute } from "next";
import { getRooms } from "@/lib/rooms";
import { getBlogPosts } from "@/lib/blog";

const BASE_URL = "https://woodpeckersguesthouse.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rooms, posts] = await Promise.all([getRooms(), getBlogPosts()]);
  const staticRoutes = [
    "",
    "/accommodation",
    "/conferencing",
    "/restaurant",
    "/gallery",
    "/attractions",
    "/blog",
    "/contact",
    "/privacy-policy",
    "/terms-conditions",
  ].map((path) => ({ url: `${BASE_URL}${path}`, lastModified: new Date() }));

  const roomRoutes = rooms.map((room) => ({
    url: `${BASE_URL}/accommodation/${room.slug}`,
    lastModified: new Date(),
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
  }));

  return [...staticRoutes, ...roomRoutes, ...blogRoutes];
}