import { connectToDb } from "@/lib/db";
import { badRequest, internalError, notFound, ok } from "@/lib/response";
import { isValidObjectId } from "@/lib/validators";
import { AiTrackModel } from "@/models/AiTrack";

type Mood = "relax" | "focus" | "sleep";
type Genre = "ambient" | "lofi" | "piano" | "cinematic";

type PatchBody = {
  title?: string;
  mood?: Mood;
  genre?: Genre;
  duration?: number;
  audioUrl?: string;
  isFree?: boolean;
  isAiGenerated?: boolean;
};

const MOODS: Mood[] = ["relax", "focus", "sleep"];
const GENRES: Genre[] = ["ambient", "lofi", "piano", "cinematic"];

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

    const item = await AiTrackModel.findById(id).lean();
    if (!item) return notFound("Track not found");

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
    if (typeof body.mood === "string") {
      if (!MOODS.includes(body.mood)) return badRequest("Invalid body: mood");
      update.mood = body.mood;
    }
    if (typeof body.genre === "string") {
      if (!GENRES.includes(body.genre)) return badRequest("Invalid body: genre");
      update.genre = body.genre;
    }
    if (typeof body.duration === "number" && Number.isFinite(body.duration)) update.duration = body.duration;
    if (typeof body.audioUrl === "string") update.audioUrl = body.audioUrl.trim();
    if (typeof body.isFree === "boolean") update.isFree = body.isFree;
    if (typeof body.isAiGenerated === "boolean" && body.isAiGenerated !== true) {
      return badRequest("isAiGenerated must remain true");
    }

    await connectToDb();

    const item = await AiTrackModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) return notFound("Track not found");

    return ok({ item });
  } catch {
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

    const deleted = await AiTrackModel.findByIdAndDelete(id).lean();
    if (!deleted) return notFound("Track not found");

    return ok({ deleted: true });
  } catch {
    return internalError();
  }
}
