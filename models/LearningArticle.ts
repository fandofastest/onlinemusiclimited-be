import mongoose, { type InferSchemaType, type Model } from "mongoose";

const LearningArticleSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningCategory",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    content: { type: String, required: true },
    summary: { type: String, required: true, trim: true },
    readingTime: { type: Number, required: true },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
      index: true
    },
    language: { type: String, required: true, enum: ["en"], default: "en", index: true },
    tags: { type: [String], required: true, default: [], index: true },
    published: { type: Boolean, required: true, default: false, index: true }
  },
  { timestamps: true }
);

LearningArticleSchema.index({ title: "text", tags: "text" });

export type LearningArticle = InferSchemaType<typeof LearningArticleSchema>;

export const LearningArticleModel: Model<LearningArticle> =
  mongoose.models.LearningArticle || mongoose.model("LearningArticle", LearningArticleSchema);
