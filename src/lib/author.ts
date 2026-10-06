import { redirect } from "next/navigation";
import { getSession, getRole } from "./session";
export async function requireAuthor() {
  const session = await getSession();
  if (!session) redirect("/signin");
  if ((await getRole(session.user)) === "user") redirect("/account");
  return session;
}
