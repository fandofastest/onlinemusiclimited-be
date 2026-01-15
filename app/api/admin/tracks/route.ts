import { connectToDb } from "@/lib/db";
import { badRequest, created, internalError, ok } from "@/lib/response";
import { AiTrackModel } from "@/models/AiTrack";

type Mood = "relax" | "focus" | "sleep";
type Genre = "ambient" | "lofi" | "piano" | "cinematic";

type Body = {
  title?: string;
  mood?: Mood;
  genre?: Genre;
  duration?: number;
  audioUrl?: string;
  isFree?: boolean;
};

const MOODS: Mood[] = ["relax", "focus", "sleep"];
const GENRES: Genre[] = ["ambient", "lofi", "piano", "cinematic"];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const moodRaw = url.searchParams.get("mood");
    const genreRaw = url.searchParams.get("genre");
    const isFreeRaw = url.searchParams.get("isFree");

    const filter: Record<string, unknown> = {};

    if (moodRaw) {
      const mood = moodRaw.trim() as Mood;
      if (!MOODS.includes(mood)) return badRequest("Invalid query param: mood");
      filter.mood = mood;
    }

    if (genreRaw) {
      const genre = genreRaw.trim() as Genre;
      if (!GENRES.includes(genre)) return badRequest("Invalid query param: genre");
      filter.genre = genre;
    }

    if (isFreeRaw !== null) {
      if (isFreeRaw !== "true" && isFreeRaw !== "false") return badRequest("Invalid query param: isFree");
      filter.isFree = isFreeRaw === "true";
    }

    await connectToDb();

    const items = await AiTrackModel.find(filter)
      .sort({ createdAt: -1 })
      .select({ title: 1, mood: 1, genre: 1, duration: 1, audioUrl: 1, isAiGenerated: 1, isFree: 1, createdAt: 1 })
      .lean();

    return ok({ items });
  } catch {
    return internalError();
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const mood = typeof body.mood === "string" ? (body.mood as Mood) : null;
    const genre = typeof body.genre === "string" ? (body.genre as Genre) : null;
    const duration = typeof body.duration === "number" && Number.isFinite(body.duration) ? body.duration : 0;
    const audioUrl = typeof body.audioUrl === "string" ? body.audioUrl.trim() : "";
    const isFree = typeof body.isFree === "boolean" ? body.isFree : true;

    if (!title || title.length > 140) return badRequest("Invalid body: title");
    if (!mood || !MOODS.includes(mood)) return badRequest("Invalid body: mood");
    if (!genre || !GENRES.includes(genre)) return badRequest("Invalid body: genre");
    if (!duration || duration <= 0) return badRequest("Invalid body: duration");
    if (!audioUrl || audioUrl.length > 500) return badRequest("Invalid body: audioUrl");

    await connectToDb();

    const doc = await AiTrackModel.create({
      title,
      mood,
      genre,
      duration,
      audioUrl,
      isAiGenerated: true,
      isFree
    });

    return created({ item: doc });
  } catch {
    return internalError();
  }
}
