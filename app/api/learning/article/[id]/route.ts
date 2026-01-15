import { connectToDb } from "@/lib/db";
import { badRequest, internalError, notFound, ok } from "@/lib/response";
import { isValidObjectId } from "@/lib/validators";
import { LearningArticleModel } from "@/models/LearningArticle";

export async function GET(
  _req: Request,
  ctx: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await ctx.params;

    if (!isValidObjectId(id)) {
      return badRequest("Invalid article id");
    }

    await connectToDb();

    const article = await LearningArticleModel.findOne({ _id: id, published: true }).lean();
    if (!article) return notFound("Article not found");

    return ok({ item: article });
  } catch {
    return internalError();
  }
}
