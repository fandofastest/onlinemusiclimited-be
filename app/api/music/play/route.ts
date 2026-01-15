import { connectToDb } from "@/lib/db";
import { badRequest, created, internalError } from "@/lib/response";
import { isValidObjectId } from "@/lib/validators";
import mongoose from "mongoose";

type PlayBody = {
  trackId?: string;
  deviceId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlayBody;

    const trackId = typeof body.trackId === "string" ? body.trackId.trim() : "";
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";

    if (!trackId || !isValidObjectId(trackId)) {
      return badRequest("Invalid body: trackId");
    }

    if (!deviceId || deviceId.length < 4 || deviceId.length > 128) {
      return badRequest("Invalid body: deviceId");
    }

    await connectToDb();

    await mongoose.connection.collection("play_events").insertOne({
      trackId: new mongoose.Types.ObjectId(trackId),
      deviceId,
      createdAt: new Date()
    });

    return created({ recorded: true });
  } catch {
    return internalError();
  }
}
