import { requireAuthor } from "@/lib/author";

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthor();
  return children;
}
