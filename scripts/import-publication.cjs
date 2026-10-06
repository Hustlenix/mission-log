/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const mongoose = require("mongoose");
async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
  });
  const db = mongoose.connection.db;
  const email = (process.env.AUTHORIZED_AUTHOR_EMAILS || "")
    .split(",")[0]
    .trim();
  const owner = await db.collection("user").findOne({ email });
  if (!owner) throw new Error("Existing owner account required.");
  const articles = JSON.parse(fs.readFileSync("data/publication.json", "utf8"));
  let inserted = 0;
  for (const article of articles) {
    const result = await db
      .collection("posts")
      .updateOne(
        { slug: article.slug },
        {
          $setOnInsert: {
            ...article,
            project: "Space publication",
            tags: article.topicIds,
            authorId: String(owner._id),
            status: "published",
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            editorialNote:
              "Source-guided explainer prepared with AI assistance. Not original reporting. Read the primary sources below; factual corrections are welcome.",
          },
        },
        { upsert: true },
      );
    inserted += result.upsertedCount;
  }
  console.log(
    `Publication import: ${inserted} new articles. Existing records unchanged.`,
  );
  await mongoose.disconnect();
}
main().catch(async () => {
  console.error("Publication import failed; no credentials printed.");
  await mongoose.disconnect();
  process.exitCode = 1;
});
