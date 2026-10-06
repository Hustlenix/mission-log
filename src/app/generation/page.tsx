import Link from "next/link";
import { Figure, PageTitle } from "@/components/publication";
import { stationImage, imageUrl } from "@/lib/catalog";
export const metadata = {
  title: "The generation relay",
  description:
    "Apollo, Shuttle, ISS, Artemis—and the work that remains to be done.",
};
const eras = [
  {
    years: "1960s–1970s",
    name: "Apollo",
    line: "A generation learned to reach the Moon.",
    detail:
      "Engineering, flight operations and science made crewed lunar exploration possible.",
    source: "https://www.nasa.gov/the-apollo-program/",
  },
  {
    years: "1981–2011",
    name: "Space Shuttle",
    line: "A generation learned to operate reusable orbiters.",
    detail:
      "The programme enabled research, deployment, servicing and assembly missions, including work on the ISS.",
    source: "https://www.nasa.gov/space-shuttle/",
  },
  {
    years: "1998–present",
    name: "International Space Station",
    line: "A generation learned to live and work continuously in orbit.",
    detail:
      "Continuous occupation began in 2000. NASA currently plans operations through 2030.",
    source: "https://www.nasa.gov/reference/international-space-station/",
  },
  {
    years: "The work ahead",
    name: "Artemis & new orbital stations",
    line: "The next chapter is being built. It is not guaranteed.",
    detail:
      "Lunar exploration and commercial low-Earth-orbit destinations involve development, testing and uncertain schedules. They need teams on Earth as well as crews in space.",
    source: "https://www.nasa.gov/artemis/",
  },
];
export default function Generation() {
  return (
    <div className="shell">
      <PageTitle
        label="The generation relay"
        title="Every era began with people looking up."
        description="Space isn’t something you just watch. It’s something your generation will build."
      />
      <Figure
        src={imageUrl("GSFC_20161102_2016-21507_012")}
        alt="Technicians beside the Webb telescope mirror"
        credit="NASA / GSFC · 2016 Webb mirror reveal / archival photograph"
        priority
      />
      <div className="relay">
        {eras.map((e, i) => (
          <section className="relay-era" key={e.name}>
            <div>
              <span className="row-number">0{i + 1}</span>
              <p className="eyebrow signal mt-4">{e.years}</p>
            </div>
            <div>
              <h2>{e.name}</h2>
              <p className="relay-line">{e.line}</p>
              <p className="dek">{e.detail}</p>
              <a className="text-action muted" href={e.source}>
                Read the NASA history ↗
              </a>
              {i === 2 && (
                <div className="mt-6">
                  <Figure
                    src={stationImage}
                    alt="The ISS above Earth"
                    credit="NASA / archival ISS image"
                  />
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
      <section className="relay-end">
        <p className="eyebrow signal">The next chapter / You</p>
        <h2>What will your generation build?</h2>
        <p className="dek">
          You don’t have to be the person in the spacecraft to be part of the
          work.
        </p>
        <Link href="/future" className="button secondary">
          Find a starting point ↗
        </Link>
        <p className="metadata mt-6">
          No employment promises. No fixed Moon or Mars deadlines. Start with a
          real question and a testable project.
        </p>
      </section>
    </div>
  );
}
