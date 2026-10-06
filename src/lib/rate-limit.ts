import { createHash } from "node:crypto";
import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "./db";
const schema = new Schema({
  key: { type: String, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, index: { expires: 0 } },
});
const RateBucket =
  mongoose.models.RateBucket || mongoose.model("RateBucket", schema);
export async function withinLimit(
  identity: string,
  action: string,
  limit = 30,
  windowSeconds = 60,
) {
  await connectToDatabase();
  const key = createHash("sha256")
    .update(
      `${identity}:${action}:${Math.floor(Date.now() / (windowSeconds * 1000))}`,
    )
    .digest("hex");
  const bucket = await RateBucket.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $setOnInsert: {
        expiresAt: new Date(
          Date.now() + Math.max(3600000, windowSeconds * 2000),
        ),
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  return bucket.count <= limit;
}
