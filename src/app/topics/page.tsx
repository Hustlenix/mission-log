import Link from "next/link";
import { topics } from "@/lib/catalog";
import { PageTitle } from "@/components/publication";
export const metadata = { title: "Explore topics" };
export default function Topics() {
  return (
    <div className="shell">
      <PageTitle
        label="Follow your curiosity"
        title="Space is not one subject."
        description="Choose a starting point. Read an explanation, check the data, then follow the questions."
      />
      {topics.map((t, i) => (
        <section className="story-row" key={t.slug}>
          <span className="row-number">0{i + 1}</span>
          <div>
            <h3>
              <Link href={`/topics/${t.slug}`}>{t.name} ↗</Link>
            </h3>
            <p className="dek">{t.description}</p>
          </div>
        </section>
      ))}
    </div>
  );
}
