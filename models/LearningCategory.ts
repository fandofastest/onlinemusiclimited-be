import mongoose, { type InferSchemaType, type Model } from "mongoose";

const LearningCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: false, trim: true },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true }
  },
  { timestamps: true }
);

export type LearningCategory = InferSchemaType<typeof LearningCategorySchema>;

export const LearningCategoryModel: Model<LearningCategory> =
  mongoose.models.LearningCategory || mongoose.model("LearningCategory", LearningCategorySchema);
