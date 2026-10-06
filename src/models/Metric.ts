import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  day: { type: String, required: true },
  event: { type: String, required: true },
  count: { type: Number, default: 0 },
  expiresAt: Date,
});
schema.index({ day: 1, event: 1 }, { unique: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Metric =
  mongoose.models.Metric || mongoose.model("Metric", schema);
