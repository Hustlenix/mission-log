import { requireAuthor } from "@/lib/author";

// Author/session checks belong to the incoming request, not static generation.
export const dynamic = "force-dynamic";

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthor();
  return children;
}
