import { connectToDb } from "@/lib/db";
import { ok, internalError } from "@/lib/response";
import { LearningCategoryModel } from "@/models/LearningCategory";

export async function GET() {
  try {
    await connectToDb();

    const categories = await LearningCategoryModel.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select({ title: 1, slug: 1, description: 1, imageUrl: 1, order: 1 })
      .lean();

    return ok({ items: categories });
  } catch {
    return internalError();
  }
}
