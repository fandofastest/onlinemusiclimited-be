import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import { badRequest, created, internalError } from "@/lib/response";
import { LearningCategoryModel } from "@/models/LearningCategory";

type Body = {
  title?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
};

export async function GET() {
  try {
    await connectToDb();

    const items = await LearningCategoryModel.find({})
      .sort({ order: 1, createdAt: 1 })
      .select({ title: 1, slug: 1, description: 1, imageUrl: 1, order: 1, isActive: 1 })
      .lean();

    return NextResponse.json({ success: true, data: { items } });
  } catch {
    return internalError();
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    const order = typeof body.order === "number" && Number.isFinite(body.order) ? body.order : 0;
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    if (!title || title.length > 120) return badRequest("Invalid body: title");
    if (!slug || slug.length > 64) return badRequest("Invalid body: slug");
    if (!description || description.length > 500) return badRequest("Invalid body: description");
    if (imageUrl && imageUrl.length > 500) return badRequest("Invalid body: imageUrl");

    await connectToDb();

    const doc = await LearningCategoryModel.create({ title, slug, description, imageUrl: imageUrl || undefined, order, isActive });

    return created({ item: doc });
  } catch (err: unknown) {
    const e = err as { code?: number; keyValue?: Record<string, unknown> };
    if (e?.code === 11000) {
      return badRequest("Duplicate key", { keyValue: e.keyValue });
    }
    return internalError();
  }
}
