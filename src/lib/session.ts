import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { getAuth } from "./auth";
import { ReaderProfile } from "@/models/Reader";
export const getSession = cache(async () => {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
});
export async function getRole(user: { id: string; email: string }) {
  // Roles are provisioned server-side. Merely registering an allowlisted email
  // must not grant publishing access when email verification is unconfigured.
  const profile = await ReaderProfile.findOne({ userId: user.id }).lean();
  return profile?.role || "user";
}
