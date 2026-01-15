import { connectToDb } from "@/lib/db";
import { badRequest, internalError, notFound, ok } from "@/lib/response";
import { isValidObjectId } from "@/lib/validators";
import { LearningArticleModel } from "@/models/LearningArticle";
import { LearningCategoryModel } from "@/models/LearningCategory";

type Level = "beginner" | "intermediate" | "advanced";

type PatchBody = {
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

export async function GET(
  _req: Request,
  ctx: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await ctx.params;
    if (!isValidObjectId(id)) return badRequest("Invalid id");

    await connectToDb();

    const item = await LearningArticleModel.findById(id).lean();
    if (!item) return notFound("Article not found");

    return ok({ item });
  } catch {
    return internalError();
  }
}

export async function PATCH(
  req: Request,
  ctx: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await ctx.params;
    if (!isValidObjectId(id)) return badRequest("Invalid id");

    const body = (await req.json()) as PatchBody;

    await connectToDb();

    const update: Record<string, unknown> = {};

    if (typeof body.categorySlug === "string") {
      const categorySlug = body.categorySlug.trim().toLowerCase();
      if (!categorySlug) return badRequest("Invalid body: categorySlug");
      const category = await LearningCategoryModel.findOne({ slug: categorySlug }).select({ _id: 1 }).lean();
      if (!category) return badRequest("Category not found", { categorySlug });
      update.categoryId = category._id;
    }

    if (typeof body.title === "string") update.title = body.title.trim();
    if (typeof body.slug === "string") update.slug = body.slug.trim().toLowerCase();
    if (typeof body.content === "string") update.content = body.content;
    if (typeof body.summary === "string") update.summary = body.summary.trim();
    if (typeof body.readingTime === "number" && Number.isFinite(body.readingTime)) update.readingTime = body.readingTime;
    if (typeof body.level === "string") {
      if (!LEVELS.includes(body.level)) return badRequest("Invalid body: level");
      update.level = body.level;
    }
    if (typeof body.language === "string") update.language = "en";
    if (Array.isArray(body.tags)) {
      update.tags = body.tags
        .filter((t) => typeof t === "string")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 32);
    }
    if (typeof body.published === "boolean") update.published = body.published;

    const item = await LearningArticleModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) return notFound("Article not found");

    return ok({ item });
  } catch (err: unknown) {
    const e = err as { code?: number; keyValue?: Record<string, unknown> };
    if (e?.code === 11000) {
      return badRequest("Duplicate key", { keyValue: e.keyValue });
    }
    return internalError();
  }
}

export async function DELETE(
  _req: Request,
  ctx: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await ctx.params;
    if (!isValidObjectId(id)) return badRequest("Invalid id");

    await connectToDb();

    const deleted = await LearningArticleModel.findByIdAndDelete(id).lean();
    if (!deleted) return notFound("Article not found");

    return ok({ deleted: true });
  } catch {
    return internalError();
  }
}
