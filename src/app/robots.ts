import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/me",
        "/settings",
        "/profile",
        "/notifications",
        "/onboarding",
        "/my-venues",
        "/login",
        "/register",
        "/verify-email",
        "/email/",
        "/password-reset",
        "/design",
        "/*/new",
        "/*/edit",
        "/*/manage",
        "/*/responses",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
