import Link from "next/link";
import { PageTitle } from "@/components/publication";
export const metadata = {
  title: "About & editorial policy",
  description:
    "An independent space publication by Hustlenix. Our sources, editorial standards, AI disclosure and privacy choices.",
};
export default function About() {
  return (
    <div className="shell">
      <PageTitle
        label="About Mission Log"
        title="Space belongs to the curious."
        description="An independent publication by Hustlenix, built by Lalith. Read the science, explore the source data, and find a small, real way to take part."
      />
      <div className="article-body prose-mission">
        <h2>A journal that grew outward</h2>
        <p>
          Mission Log started as a place to document building projects. That
          journal still exists. The publication adds source-guided space
          explainers, NASA data tools and a personal reading workspace. You
          don’t need an account to read or explore.
        </p>
        <h2>What we publish</h2>
        <p>
          We separate explainers, opinion, builder journals and recorded
          observations. A retrieved data snapshot is not original reporting. The
          initial publication articles are AI-assisted, source-guided
          explainers, disclosed alongside each article. They should not be
          treated as independently reported news or a substitute for their
          primary sources.
        </p>
        <h2>Source first. Context second.</h2>
        <p>
          Science claims should link to NASA, JPL or another identifiable
          primary source. Images need a caption and credit. Archival
          photographs, composites and illustrations are labeled. Capture time,
          retrieval time and publication time mean different things; all
          displayed times are UTC unless stated.
        </p>
        <p>
          “Potentially hazardous” is a classification, not a predicted impact.
          Our space-weather catalogue is not an aurora forecast or an alert
          service. Live tools show cached records and say when refreshes fail;
          they never invent fresh numbers.
        </p>
        <h2>Corrections & responsibility</h2>
        <p>
          Editors control publication. Authors can submit their own drafts for
          review. This small release does not yet offer moderated public
          comments. To report an error, include the page URL, the claim and a
          supporting source in a{" "}
          <a href="https://github.com/Hustlenix/mission-log/issues">
            GitHub issue
          </a>
          . Please don’t put personal information or credentials there.
        </p>
        <h2>Independent, not official</h2>
        <p>
          Mission Log is not affiliated with or endorsed by NASA, JPL or the
          organizations we reference. Source imagery can carry third-party
          rights. Check the original credit and licensing before reusing it.
        </p>
        <h2>Your privacy choices</h2>
        <p>
          Accounts store your name, email, password hash and session records.
          Saved items, follows and private collections belong to your account.
          Unlisted or public collections can be viewed by others with the link;
          your email is not included.
        </p>
        <p>
          Reading history starts off. You can enable it, disable future
          recording, or clear it in your account. Progress is estimated from
          scrolling, not evidence that you read an article. There are no
          advertising trackers. We keep daily aggregate article-render, search
          and save/follow counts, without raw search terms or visitor
          identifiers. These are not unique-visitor measurements. Hosting
          providers may maintain operational logs.
        </p>
        <p>
          Email verification, password-reset delivery, newsletters and push
          alerts are not connected in this release. Do not reuse a password from
          another service. For account removal, contact the maintainer through
          the <a href="https://github.com/Hustlenix/mission-log">repository</a>;
          a self-service deletion flow is still needed before wider promotion.
        </p>
        <div className="actions">
          <Link className="text-action" href="/latest">
            Read the publication ↗
          </Link>
          <Link className="text-action" href="/missions">
            Builder journal ↗
          </Link>
          <Link className="text-action" href="/account">
            Privacy controls ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
