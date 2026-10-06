import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { connectToDatabase } from "./db";

let authPromise: ReturnType<typeof initializeAuth> | undefined;

async function initializeAuth() {
  await connectToDatabase();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection not established");
  }

  const authInstance = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 10 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  });

  return authInstance;
}

export async function getAuth() {
  if (!authPromise) {
    authPromise = initializeAuth().catch((error) => {
      authPromise = undefined;
      throw error;
    });
  }
  return authPromise;
}
