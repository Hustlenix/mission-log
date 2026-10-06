import { getArticles } from "@/lib/publication";
import { PageTitle, StoryRow, Unavailable } from "@/components/publication";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Latest stories",
  description: "Space science, explained without the fearbait.",
};
export default async function Latest() {
  const posts = await getArticles();
  return (
    <div className="shell">
      <PageTitle
        label="The publication"
        title="The latest."
        description="Space science, the people behind it, and the work that comes next."
      />
      {posts ? (
        posts
          .sort((a, b) => +(b.publishedAt || 0) - +(a.publishedAt || 0))
          .map((p, i) => <StoryRow key={p.slug} post={p} number={i} />)
      ) : (
        <Unavailable name="Stories" />
      )}
    </div>
  );
}
