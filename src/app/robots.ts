import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Что можно показывать в Яндексе и Google, а что нет
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/cart", "/checkout", "/favorites", "/demo", "/api/ask"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
