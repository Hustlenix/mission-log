import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { connectToDatabase } from "./db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authInstance: any = null;

export async function getAuth() {
  if (authInstance) return authInstance;

  await connectToDatabase();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection not established");
  }

  authInstance = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  });

  return authInstance;
}
