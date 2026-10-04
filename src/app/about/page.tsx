import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <p className="font-mono text-xs text-accent tracking-widest mb-6">ABOUT</p>
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-8">
        HI, I&apos;m LALITH.
      </h1>
      <div className="prose-mission">
        <p>
          I build games, hardware, websites and occasionally projects that probably should have remained ideas.
        </p>
        <p>
          Mission Log exists because Git commits, screenshots and random messages are terrible ways of remembering
          how something was built.
        </p>
        <p>This is where I document:</p>
        <ul>
          <li>what worked</li>
          <li>what broke</li>
          <li>what changed</li>
          <li>and what I learned</li>
        </ul>
        <p>Currently building through Stardance 2026.</p>
      </div>
      <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-border">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors"
        >
          GITHUB
        </a>
        <a
          href="https://stardance.hackclub.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors"
        >
          STARDANCE
        </a>
        <Link
          href="/missions"
          className="font-mono text-xs tracking-wider text-muted hover:text-accent transition-colors"
        >
          PROJECTS
        </Link>
      </div>
    </div>
  );
}
