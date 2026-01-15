import mongoose, { type InferSchemaType, type Model } from "mongoose";

const AiTrackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    mood: { type: String, required: true, enum: ["relax", "focus", "sleep"], index: true },
    genre: {
      type: String,
      required: true,
      enum: ["ambient", "lofi", "piano", "cinematic"],
      index: true
    },
    duration: { type: Number, required: true },
    audioUrl: { type: String, required: true, trim: true },
    isAiGenerated: { type: Boolean, required: true, default: true, immutable: true },
    isFree: { type: Boolean, required: true, default: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AiTrack = InferSchemaType<typeof AiTrackSchema>;

export const AiTrackModel: Model<AiTrack> =
  mongoose.models.AiTrack || mongoose.model("AiTrack", AiTrackSchema);
