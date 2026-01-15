import { connectToDb } from "@/lib/db";
import { badRequest, created, internalError, ok } from "@/lib/response";
import { LearningArticleModel } from "@/models/LearningArticle";
import { LearningCategoryModel } from "@/models/LearningCategory";

type Level = "beginner" | "intermediate" | "advanced";

type Body = {
  categorySlug?: string;
  title?: string;
  slug?: string;
  content?: string;
  summary?: string;
  readingTime?: number;
  level?: Level;
  language?: "en";
  tags?: string[];
  published?: boolean;
};

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categorySlugRaw = url.searchParams.get("category");
    const publishedRaw = url.searchParams.get("published");
    const qRaw = url.searchParams.get("q");

    await connectToDb();

    const filter: Record<string, unknown> = {};

    if (publishedRaw !== null) {
      if (publishedRaw !== "true" && publishedRaw !== "false") {
        return badRequest("Invalid query param: published");
      }
      filter.published = publishedRaw === "true";
    }

    if (categorySlugRaw) {
      const categorySlug = categorySlugRaw.trim().toLowerCase();
      const category = await LearningCategoryModel.findOne({ slug: categorySlug })
        .select({ _id: 1 })
        .lean();
      if (!category) return ok({ items: [] });
      filter.categoryId = category._id;
    }

    if (qRaw) {
      const q = qRaw.trim();
      if (q.length > 80) return badRequest("Invalid query param: q");
      filter.$or = [{ title: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }];
    }

    const items = await LearningArticleModel.find(filter)
      .sort({ createdAt: -1 })
      .select({
        categoryId: 1,
        title: 1,
        slug: 1,
        summary: 1,
        readingTime: 1,
        level: 1,
        language: 1,
        tags: 1,
        published: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .lean();

    return ok({ items });
  } catch {
    return internalError();
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const categorySlug = typeof body.categorySlug === "string" ? body.categorySlug.trim().toLowerCase() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
    const content = typeof body.content === "string" ? body.content : "";
    const summary = typeof body.summary === "string" ? body.summary.trim() : "";
    const readingTime =
      typeof body.readingTime === "number" && Number.isFinite(body.readingTime) ? body.readingTime : 0;
    const level = typeof body.level === "string" ? (body.level as Level) : null;
    const language = body.language === "en" ? "en" : "en";
    const published = typeof body.published === "boolean" ? body.published : false;

    const tags = Array.isArray(body.tags)
      ? body.tags
          .filter((t) => typeof t === "string")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0 && t.length <= 32)
      : [];

    if (!categorySlug || categorySlug.length > 64) return badRequest("Invalid body: categorySlug");
    if (!title || title.length > 140) return badRequest("Invalid body: title");
    if (!slug || slug.length > 80) return badRequest("Invalid body: slug");
    if (!content) return badRequest("Invalid body: content");
    if (!summary || summary.length > 500) return badRequest("Invalid body: summary");
    if (!readingTime || readingTime <= 0) return badRequest("Invalid body: readingTime");
    if (!level || !LEVELS.includes(level)) return badRequest("Invalid body: level");

    await connectToDb();

    const category = await LearningCategoryModel.findOne({ slug: categorySlug })
      .select({ _id: 1 })
      .lean();

    if (!category) return badRequest("Category not found", { categorySlug });

    const doc = await LearningArticleModel.create({
      categoryId: category._id,
      title,
      slug,
      content,
      summary,
      readingTime,
      level,
      language,
      tags,
      published
    });

    return created({ item: doc });
  } catch (err: unknown) {
    const e = err as { code?: number; keyValue?: Record<string, unknown> };
    if (e?.code === 11000) {
      return badRequest("Duplicate key", { keyValue: e.keyValue });
    }
    return internalError();
  }
}
