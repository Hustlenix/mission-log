import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

export async function requireAuthor() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");
  const emails = (process.env.AUTHORIZED_AUTHOR_EMAILS || "").split(",").map(email => email.trim().toLowerCase());
  if (!emails.includes(session.user.email.toLowerCase())) redirect("/blogs");
  return session;
}
