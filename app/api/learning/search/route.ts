import { connectToDb } from "@/lib/db";
import { badRequest, internalError, ok } from "@/lib/response";
import { getStringParam } from "@/lib/validators";
import { LearningArticleModel } from "@/models/LearningArticle";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = getStringParam(url.searchParams.get("q"), { minLen: 1, maxLen: 80 });

    if (!q) {
      return badRequest("Missing or invalid query param: q");
    }

    await connectToDb();

    const tagCandidate = q.toLowerCase();

    const items = await LearningArticleModel.find({
      published: true,
      $or: [{ title: { $regex: q, $options: "i" } }, { tags: tagCandidate }]
    })
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

    return ok({ items });
  } catch {
    return internalError();
  }
}
