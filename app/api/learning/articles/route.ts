import { connectToDb } from "@/lib/db";
import { badRequest, internalError, ok } from "@/lib/response";
import { getStringParam } from "@/lib/validators";
import { LearningArticleModel } from "@/models/LearningArticle";
import { LearningCategoryModel } from "@/models/LearningCategory";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categorySlug = getStringParam(url.searchParams.get("category"), {
      minLen: 1,
      maxLen: 64
    });

    if (!categorySlug) {
      return badRequest("Missing or invalid query param: category");
    }

    await connectToDb();

    const category = await LearningCategoryModel.findOne({ slug: categorySlug, isActive: true })
      .select({ _id: 1 })
      .lean();

    if (!category) {
      return ok({ items: [] });
    }

    const articles = await LearningArticleModel.find({ categoryId: category._id, published: true })
      .sort({ createdAt: -1 })
      .select({
        title: 1,
        slug: 1,
        summary: 1,
        readingTime: 1,
        level: 1,
        language: 1,
        tags: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .lean();

    return ok({ items: articles });
  } catch {
    return internalError();
  }
}
