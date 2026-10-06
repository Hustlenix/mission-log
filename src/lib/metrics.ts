import "server-only";
import { connectToDatabase } from "./db";
import { Metric } from "@/models/Metric";
export async function countEvent(
  event: "article-render" | "search" | "save" | "follow",
) {
  try {
    await connectToDatabase();
    const day = new Date().toISOString().slice(0, 10);
    await Metric.updateOne(
      { day, event },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(Date.now() + 90 * 86400000) },
      },
      { upsert: true },
    );
  } catch {
    /* Analytics must never interrupt reading or account operations. */
  }
}
export async function recentMetrics() {
  try {
    await connectToDatabase();
    return await Metric.aggregate([
      {
        $match: {
          day: {
            $gte: new Date(Date.now() - 6 * 86400000)
              .toISOString()
              .slice(0, 10),
          },
        },
      },
      { $group: { _id: "$event", count: { $sum: "$count" } } },
    ]);
  } catch {
    return null;
  }
}
