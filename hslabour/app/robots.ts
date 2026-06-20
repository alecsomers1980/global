import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/affiliate",
        "/orders",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/auth",
        "/ebook/checkout",
        "/ebook/success",
        "/shop/checkout",
        "/shop/success",
      ],
    },
    sitemap: "https://hslabour.co.za/sitemap.xml",
    host: "https://hslabour.co.za",
  };
}