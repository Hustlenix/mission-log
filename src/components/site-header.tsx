"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const navLinks = [
  { href: "/blogs", label: "LOGS" },
  { href: "/missions", label: "MISSIONS" },
  { href: "/archive", label: "ARCHIVE" },
  { href: "/about", label: "ABOUT" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-border bg-background/95 backdrop-blur-sm" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
            <span className="font-mono text-sm font-semibold tracking-wider text-foreground group-hover:text-accent transition-colors">
              HUSTLENIX<span className="text-muted">//</span>MISSION_LOG
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-xs tracking-wider transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/archive"
              className="font-mono text-xs tracking-wider text-muted hover:text-foreground transition-colors"
              aria-label="Search"
            >
              [SEARCH]
            </Link>
            {isPending ? (
              <span className="font-mono text-xs text-muted">...</span>
            ) : session ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-success">
                  &bull; {session.user.name?.toUpperCase() || "USER"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="font-mono text-xs tracking-wider text-muted hover:text-foreground transition-colors"
                >
                  SIGN_OUT
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                className="font-mono text-xs tracking-wider text-muted hover:text-foreground transition-colors"
              >
                SIGN_IN
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-border py-4 animate-fade-in" aria-label="Mobile navigation">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-mono text-sm tracking-wider py-2 ${
                    pathname.startsWith(link.href)
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-3 mt-2 flex flex-col gap-3">
                <Link
                  href="/archive"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-sm tracking-wider py-2 text-muted hover:text-foreground"
                >
                  SEARCH
                </Link>
                {session ? (
                  <>
                    <span className="font-mono text-sm tracking-wider py-2 text-success">
                      &bull; {session.user.name?.toUpperCase() || "USER"}
                    </span>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      className="font-mono text-sm tracking-wider py-2 text-muted hover:text-foreground text-left"
                    >
                      SIGN_OUT
                    </button>
                  </>
                ) : (
                  <Link
                    href="/signin"
                    onClick={() => setMobileOpen(false)}
                    className="font-mono text-sm tracking-wider py-2 text-muted hover:text-foreground"
                  >
                    SIGN_IN
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
