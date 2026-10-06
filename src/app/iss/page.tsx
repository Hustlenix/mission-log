import Link from "next/link";
import { Figure, PageTitle } from "@/components/publication";
import { stationImage } from "@/lib/catalog";
export const metadata = {
  title: "The ISS legacy",
  description:
    "The station, the people and the knowledge handed to the next generation.",
};
export default function Iss() {
  return (
    <div className="shell">
      <PageTitle
        label="The human story / International Space Station"
        title="Someone has been up there."
        description="Since 2 November 2000, the ISS has been continuously occupied. A generation has grown up with a laboratory above Earth."
      />
      <Figure
        src={stationImage}
        alt="ISS seen from an approaching spacecraft with Earth behind it"
        credit="NASA · iss056e201248 / archival image"
        priority
      />
      <div className="documentary-copy">
        <p className="eyebrow signal">1998 / Assembly begins</p>
        <h2>Not a single launch. A shared undertaking.</h2>
        <p>
          The first module launched in 1998. The station grew through launches,
          assembly work and international cooperation. The people maintaining it
          are as much a part of the story as the structure itself.
        </p>
        <p className="eyebrow signal">2000 / Continuous occupation</p>
        <h2>The ordinary work of living away from home.</h2>
        <p>
          Research needs working equipment, power, clean air and careful
          procedures. The station is a laboratory, a home, and a system that
          people keep running.
        </p>
        <p className="eyebrow signal">The current plan / Through 2030</p>
        <h2>A planning horizon. Not an exact last orbit.</h2>
        <p>
          NASA currently plans ISS operations through 2030 while supporting
          commercial destinations in low Earth orbit. Future stations must still
          be developed and operated; the transition is not a guaranteed
          timetable.
        </p>
        <p className="eyebrow signal">What comes next</p>
        <h2>The station ends. Human presence in orbit does not have to.</h2>
        <p>
          Hardware has a lifetime. Knowledge can travel further. The next
          systems need scientists, technicians, software, medical research and
          teams that can keep learning.
        </p>
        <Link href="/generation" className="text-action">
          Follow the generation relay ↗
        </Link>
        <div className="source-block">
          <p className="eyebrow">Sources / Checked 5 October 2026</p>
          <a href="https://www.nasa.gov/reference/international-space-station/">
            NASA — ISS reference ↗
          </a>
          <a href="https://www.nasa.gov/faqs-the-international-space-station-transition-plan/">
            NASA — Current transition plan ↗
          </a>
          <a href="https://www.nasa.gov/humans-in-space/commercial-space/commercial-space-stations/">
            NASA — Commercial destinations ↗
          </a>
          <p className="muted">
            A source-guided documentary introduction prepared with AI
            assistance. No exact deorbit date is asserted.
          </p>
        </div>
      </div>
    </div>
  );
}
