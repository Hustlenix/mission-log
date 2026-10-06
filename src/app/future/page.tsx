import Link from "next/link";
import { PageTitle } from "@/components/publication";
export const metadata = { title: "Your path into space" };
const paths = [
  {
    name: "Software",
    work: "Scientific computing, embedded systems, simulation and robotics.",
    learn:
      "Learn to read a public API, validate its data and test failure cases.",
    build: "Build an asteroid table with a date filter. Explain every number.",
    source: "https://software.nasa.gov/",
  },
  {
    name: "Electronics & making",
    work: "Sensors, power, communication systems and reliable hardware.",
    learn:
      "Learn circuits and measurements before connecting unfamiliar components.",
    build:
      "Measure a sensor on your desk. Keep a log of accuracy and uncertainty.",
    source: "https://www.nasa.gov/stem/",
  },
  {
    name: "Science",
    work: "Planetary research, astronomy, biology and Earth observation.",
    learn: "Start with the methods behind an observation, not only the result.",
    build:
      "Compare two EPIC frames and document what the imagery can—and cannot—show.",
    source: "https://science.nasa.gov/citizen-science/",
  },
  {
    name: "Words & design",
    work: "Science communication, visualization, documentation and education.",
    learn: "Practice explaining a technical distinction using primary sources.",
    build:
      "Explain the difference between a solar flare and a CME in a one-page diagram.",
    source: "https://www.nasa.gov/careers/",
  },
];
export default function Future() {
  return (
    <div className="shell">
      <PageTitle
        label="The next crew"
        title="Bigger than astronauts."
        description="Choose a kind of work you enjoy. Build something small enough to test. Keep learning from the result."
      />
      {paths.map((p) => (
        <section key={p.name} className="path-row">
          <h2>{p.name}</h2>
          <div>
            <p className="dek">{p.work}</p>
            <p className="eyebrow signal mt-5">Learn</p>
            <p className="muted">{p.learn}</p>
            <p className="eyebrow signal mt-5">Build</p>
            <p>{p.build}</p>
            <a href={p.source} className="text-action">
              Official resources ↗
            </a>
          </div>
        </section>
      ))}
      <div className="source-block">
        <h2 className="text-2xl">A global path—not a NASA job promise.</h2>
        <p className="muted">
          NASA is one destination. Universities, international agencies,
          research groups and space companies also need these skills. NASA
          federal jobs and particular internships have citizenship and education
          requirements; always check the official programme’s eligibility.
        </p>
        <a href="https://www.nasa.gov/careers/">
          NASA careers and eligibility ↗
        </a>
        <a href="https://science.nasa.gov/citizen-science/">
          NASA citizen-science projects · check each project’s requirements ↗
        </a>
        <Link
          href="/articles/the-next-crew-is-bigger-than-astronauts"
          className="text-action"
        >
          Read the practical starting guide ↗
        </Link>
      </div>
    </div>
  );
}
