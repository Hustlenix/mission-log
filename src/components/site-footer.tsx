import Link from "next/link";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <Link href="/" className="wordmark">
              MISSION LOG ↗
            </Link>
            <p>
              Space, decoded daily. An independent publication about the
              science, the people, and what we build next.
            </p>
          </div>
          <div>
            <Link href="/latest">Read the publication</Link>
            <Link href="/live">Live space data</Link>
            <Link href="/media">NASA media archive</Link>
            <Link href="/missions">Builder journal</Link>
          </div>
          <div>
            <Link href="/about">About & editorial policy</Link>
            <Link href="/account">Your Mission Log</Link>
            <Link href="/studio">Editorial studio</Link>
            <a href="https://github.com/Hustlenix/mission-log">Source code ↗</a>
          </div>
        </div>
        <p>
          Not affiliated with or endorsed by NASA. NASA/JPL data and selected
          imagery are credited to their sources. Third-party image rights may
          apply. No advertising trackers; private saves and reading history
          belong to your account.
        </p>
        <p className="metadata mt-4">
          © {new Date().getUTCFullYear()} Mission Log / Hustlenix · All times
          UTC unless stated.
        </p>
      </div>
    </footer>
  );
}
