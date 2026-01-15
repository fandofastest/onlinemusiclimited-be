import { connectToDb } from "@/lib/db";
import { badRequest, internalError, ok } from "@/lib/response";
import { getEnumParam } from "@/lib/validators";
import { AiTrackModel } from "@/models/AiTrack";

const MOODS = ["relax", "focus", "sleep"] as const;
const GENRES = ["ambient", "lofi", "piano", "cinematic"] as const;

const DISCLAIMER = "All tracks are AI-generated and royalty-free.";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const moodRaw = url.searchParams.get("mood");
    const genreRaw = url.searchParams.get("genre");

    const mood = moodRaw ? getEnumParam(moodRaw, MOODS) : null;
    const genre = genreRaw ? getEnumParam(genreRaw, GENRES) : null;

    if (moodRaw && !mood) return badRequest("Invalid query param: mood");
    if (genreRaw && !genre) return badRequest("Invalid query param: genre");

    await connectToDb();

    const filter: Record<string, unknown> = { isAiGenerated: true };
    if (mood) filter.mood = mood;
    if (genre) filter.genre = genre;

    const items = await AiTrackModel.find(filter)
      .sort({ createdAt: -1 })
      .select({ title: 1, mood: 1, genre: 1, duration: 1, audioUrl: 1, isAiGenerated: 1, isFree: 1 })
      .lean();

    return ok({ disclaimer: DISCLAIMER, items });
  } catch {
    return internalError();
  }
}
