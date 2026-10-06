import mongoose, { Schema } from "mongoose";
const schema = new Schema(
  {
    key: { type: String, unique: true, required: true },
    data: Schema.Types.Mixed,
    fetchedAt: Date,
    expiresAt: Date,
    lockUntil: Date,
    retryAt: Date,
    source: String,
    sourceVersion: String,
  },
  { timestamps: true },
);
export const NasaCache =
  mongoose.models.NasaCache || mongoose.model("NasaCache", schema);
