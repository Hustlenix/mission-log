/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");
async function main() {
  const email = process.env.AUTHOR_EMAIL;
  const allowed = (process.env.AUTHORIZED_AUTHOR_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase());
  if (
    !email ||
    !allowed.includes(email.toLowerCase()) ||
    process.argv[2] !== "--grant-admin"
  )
    throw new Error("Explicit owner configuration and --grant-admin required.");
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  const db = mongoose.connection.db;
  const user = await db.collection("user").findOne({ email });
  if (!user)
    throw new Error("Existing owner account required; no account created.");
  await db
    .collection("readerprofiles")
    .updateOne(
      { userId: String(user._id) },
      {
        $set: { role: "admin", updatedAt: new Date() },
        $setOnInsert: { recordHistory: false, createdAt: new Date() },
      },
      { upsert: true },
    );
  console.log(
    "Existing owner granted server-side admin role. Email verification status unchanged.",
  );
}
main()
  .catch(() => {
    console.error("Owner provisioning failed; no credentials printed.");
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
