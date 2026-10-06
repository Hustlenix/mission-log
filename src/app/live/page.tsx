import Link from "next/link";
import { PageTitle } from "@/components/publication";
export const metadata = { title: "Live space data" };
const tools = [
  {
    title: "Near-Earth objects",
    href: "/live/asteroids",
    description:
      "Dates, distances, estimated sizes. NASA’s real classifications, not a made-up danger score.",
  },
  {
    title: "Space weather",
    href: "/live/space-weather",
    description:
      "Seven days of recorded solar and geomagnetic events. An observation catalogue, not a local forecast.",
  },
  {
    title: "Earth imagery",
    href: "/live/earth",
    description:
      "DSCOVR / EPIC’s latest available frames, with capture time and product metadata.",
  },
  {
    title: "Today in space",
    href: "/daily",
    description:
      "A concise, source-linked snapshot. Cached observations with their freshness visible.",
  },
];
export default function Live() {
  return (
    <div className="shell">
      <PageTitle
        label="The instruments"
        title="The data. In context."
        description="Public NASA feeds, normalized and cached on our server. Useful without an account."
      />
      {tools.map((t) => (
        <section key={t.href} className="result-row">
          <h2>
            <Link href={t.href}>{t.title} ↗</Link>
          </h2>
          <p className="dek">{t.description}</p>
        </section>
      ))}
      <p className="metadata my-8">
        External feeds can be delayed or unavailable. Capture time, event time
        and fetch time are different.
      </p>
    </div>
  );
}
