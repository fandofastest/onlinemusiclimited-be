import { ok } from "@/lib/response";

export async function GET() {
  return ok({
    name: "Online Music Limited API",
    version: "1.0.0",
    notes: {
      compliance:
        "No copyrighted music. No artist imitation. Tracks are AI-generated, royalty-free, instrumental. Learning content is text-based educational material.",
      auth:
        "Public API has no auth. Admin endpoints require admin login session (ADMIN_USER/ADMIN_PASS) and are intended for internal content management only.",
      cloudinary:
        "Admin UI uploads category images and track audio directly to Cloudinary using a server-side signed upload helper. Configure CLOUDINARY_* env vars."
    },
    publicApi: {
      health: [{ method: "GET", path: "/api/health" }],
      config: [{ method: "GET", path: "/api/config" }],
      learning: [
        {
          method: "GET",
          path: "/api/learning/categories",
          query: {},
          returns: "Active categories ordered by order (includes imageUrl)."
        },
        {
          method: "GET",
          path: "/api/learning/articles",
          query: { category: "slug (required)" },
          returns: "Published article summaries by category."
        },
        {
          method: "GET",
          path: "/api/learning/article/[id]",
          params: { id: "Mongo ObjectId" },
          returns: "Full published article content."
        },
        {
          method: "GET",
          path: "/api/learning/search",
          query: { q: "keyword (required)" },
          returns: "Search published articles by title or tags."
        }
      ],
      music: [
        {
          method: "GET",
          path: "/api/music/ai",
          query: { mood: "relax|focus|sleep (optional)", genre: "ambient|lofi|piano|cinematic (optional)" },
          returns: "AI tracks. Response includes disclaimer: 'All tracks are AI-generated and royalty-free.'"
        },
        {
          method: "POST",
          path: "/api/music/play",
          body: { trackId: "ObjectId", deviceId: "string" },
          returns: "Anonymous analytics event recorded (no personal data)."
        }
      ]
    },
    adminApi: {
      auth: [
        { method: "POST", path: "/api/admin/auth/login", body: { username: "string", password: "string" } },
        { method: "POST", path: "/api/admin/auth/logout" }
      ],
      cloudinary: [
        {
          method: "POST",
          path: "/api/admin/cloudinary/sign",
          body: { resourceType: "image|video", folder: "string (optional)" },
          returns: "Signed upload params for direct-to-Cloudinary upload from Admin UI."
        }
      ],
      categories: [
        { method: "GET", path: "/api/admin/categories" },
        {
          method: "POST",
          path: "/api/admin/categories",
          body: { title: "string", slug: "string", description: "string", imageUrl: "string (optional)", order: "number", isActive: "boolean" }
        },
        { method: "GET", path: "/api/admin/categories/[id]" },
        { method: "PATCH", path: "/api/admin/categories/[id]" },
        { method: "DELETE", path: "/api/admin/categories/[id]" }
      ],
      articles: [
        {
          method: "GET",
          path: "/api/admin/articles",
          query: { category: "slug (optional)", published: "true|false (optional)", q: "keyword (optional)" }
        },
        {
          method: "POST",
          path: "/api/admin/articles",
          body: {
            categorySlug: "string",
            title: "string",
            slug: "string",
            content: "string",
            summary: "string",
            readingTime: "number",
            level: "beginner|intermediate|advanced",
            language: "en",
            tags: "string[]",
            published: "boolean"
          }
        },
        { method: "GET", path: "/api/admin/articles/[id]" },
        { method: "PATCH", path: "/api/admin/articles/[id]" },
        { method: "DELETE", path: "/api/admin/articles/[id]" }
      ],
      tracks: [
        {
          method: "GET",
          path: "/api/admin/tracks",
          query: { mood: "relax|focus|sleep (optional)", genre: "ambient|lofi|piano|cinematic (optional)", isFree: "true|false (optional)" }
        },
        {
          method: "POST",
          path: "/api/admin/tracks",
          body: {
            title: "string",
            mood: "relax|focus|sleep",
            genre: "ambient|lofi|piano|cinematic",
            duration: "number",
            audioUrl: "string",
            isFree: "boolean"
          }
        },
        { method: "GET", path: "/api/admin/tracks/[id]" },
        { method: "PATCH", path: "/api/admin/tracks/[id]" },
        { method: "DELETE", path: "/api/admin/tracks/[id]" }
      ]
    }
  });
}
