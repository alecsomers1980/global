import type { MetadataRoute } from "next";
import { getRooms } from "@/lib/rooms";

const BASE_URL = "https://woodpeckersguesthouse.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rooms = await getRooms();
  const staticRoutes = [
    "",
    "/accommodation",
    "/conferencing",
    "/restaurant",
    "/gallery",
    "/attractions",
    "/contact",
    "/privacy-policy",
    "/terms-conditions",
  ].map((path) => ({ url: `${BASE_URL}${path}`, lastModified: new Date() }));

  const roomRoutes = rooms.map((room) => ({
    url: `${BASE_URL}/accommodation/${room.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...roomRoutes];
}