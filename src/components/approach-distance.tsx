import type { Approach } from "@/lib/nasa/types";
import { distanceScale } from "@/lib/nasa/approach";

export function ApproachDistance({ approach }: { approach: Approach }) {
  const scale = distanceScale(approach.lunar);
  if (!scale) return <p>Distance comparison unavailable for this record.</p>;
  return (
    <figure className="approach-comparison" aria-label="Linear close-approach distance comparison">
      <figcaption>
        <p className="eyebrow signal">One shared, linear distance scale</p>
        <h2>{approach.lunar.toFixed(2)} lunar distances from Earth</h2>
      </figcaption>
      <div className="comparison-row">
        <span>Average Earth–Moon separation · 1 LD</span>
        <div className="comparison-track" aria-hidden="true"><div style={{ width: `${scale.moonPercent}%` }} /></div>
      </div>
      <div className="comparison-row">
        <span>Selected asteroid approach · {approach.lunar.toFixed(2)} LD</span>
        <div className="comparison-track" aria-hidden="true"><div style={{ width: `${scale.asteroidPercent}%` }} /></div>
      </div>
      <p className="metadata">Both bars start at Earth (0) and share an axis ending at {scale.maximum.toFixed(2)} LD. LD is NASA’s lunar-distance unit. Bar lengths are proportional; body sizes and positions are not depicted.</p>
      <p>{approach.distance.toLocaleString("en-US", { maximumFractionDigits: 0 })} km · {approach.time.replace("T", " ").slice(0, 16)} UTC · {Math.round(approach.speed).toLocaleString("en-US")} km/h relative speed</p>
      <p className="muted">This compares a catalogued miss distance with average Earth–Moon separation. It is not an orbit simulation, the Moon’s position at this time, or an impact probability. Approach predictions can change with additional observations.</p>
    </figure>
  );
}
