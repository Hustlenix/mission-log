import { getArticles } from "@/lib/publication";
import { PageTitle, StoryRow, Unavailable } from "@/components/publication";
export const dynamic = "force-dynamic";
export const metadata = { title: "Learn the science" };
export default async function Learn() {
  const posts = await getArticles();
  return (
    <div className="shell">
      <PageTitle
        label="The reading room"
        title="Start with a question."
        description="Plain-language explanations. Primary sources. No invented danger scores."
      />
      {posts ? (
        posts
          .filter(
            (p) => p.contentType === "explainer" || p.contentType === "guide",
          )
          .map((p) => <StoryRow key={p.slug} post={p} />)
      ) : (
        <Unavailable name="The reading room" />
      )}
    </div>
  );
}
