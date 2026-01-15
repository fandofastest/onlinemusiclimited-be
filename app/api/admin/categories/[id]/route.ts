import { connectToDb } from "@/lib/db";
import { badRequest, internalError, notFound, ok } from "@/lib/response";
import { isValidObjectId } from "@/lib/validators";
import { LearningCategoryModel } from "@/models/LearningCategory";

type PatchBody = {
  title?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
};

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

    const item = await LearningCategoryModel.findById(id).lean();
    if (!item) return notFound("Category not found");

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

    const update: Record<string, unknown> = {};

    if (typeof body.title === "string") update.title = body.title.trim();
    if (typeof body.slug === "string") update.slug = body.slug.trim().toLowerCase();
    if (typeof body.description === "string") update.description = body.description.trim();
    if (typeof body.imageUrl === "string") update.imageUrl = body.imageUrl.trim() || undefined;
    if (typeof body.order === "number" && Number.isFinite(body.order)) update.order = body.order;
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;

    if (update.title !== undefined && (update.title as string).length === 0) return badRequest("Invalid body: title");
    if (update.slug !== undefined && (update.slug as string).length === 0) return badRequest("Invalid body: slug");

    await connectToDb();

    const item = await LearningCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) return notFound("Category not found");

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

    const deleted = await LearningCategoryModel.findByIdAndDelete(id).lean();
    if (!deleted) return notFound("Category not found");

    return ok({ deleted: true });
  } catch {
    return internalError();
  }
}
