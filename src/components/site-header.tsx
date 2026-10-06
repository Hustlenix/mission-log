"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
const links = [
  { href: "/latest", label: "Latest" },
  { href: "/live", label: "Live" },
  { href: "/topics", label: "Explore" },
  { href: "/learn", label: "Learn" },
  { href: "/generation", label: "Future" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const { data: session } = authClient.useSession();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.ctrlKey || e.metaKey)) ||
        (e.key === "/" &&
          !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName))
      ) {
        e.preventDefault();
        dialog.current?.showModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <header className="site-header">
      <div className="shell">
        <div className="nav-bar">
          <Link href="/" className="wordmark">
            <span className="brand-mark" aria-hidden="true">
              ↗
            </span>
            MISSION LOG
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname.startsWith(l.href) ? "nav-active" : ""}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              onClick={() => dialog.current?.showModal()}
              aria-label="Search Mission Log"
            >
              Search <span className="muted hidden lg:inline">/</span>
            </button>
            <Link
              className="account-link"
              href={session ? "/account" : "/signin"}
            >
              {session ? "My log" : "Sign in"}
            </Link>
          </div>
          <button
            className="mobile-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {[
              ...links,
              {
                href: session ? "/account" : "/signin",
                label: session ? "My log" : "Sign in",
              },
            ].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-labelledby="search-heading"
      >
        <div className="flex justify-between items-center">
          <h2 id="search-heading" className="eyebrow">
            Search Mission Log
          </h2>
          <button
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
            className="p-3"
          >
            ✕
          </button>
        </div>
        <form
          action="/search"
          className="search-form"
          onSubmit={() => dialog.current?.close()}
        >
          <input
            autoFocus
            name="q"
            aria-label="Search space"
            placeholder="Mars, asteroids, space stations…"
            maxLength={120}
          />
          <button className="button">Search</button>
        </form>
        <p className="muted text-sm">
          Articles, topics, explainers, NASA media and near-Earth objects.
        </p>
        <div className="actions">
          {["asteroids", "iss", "moon"].map((t) => (
            <Link
              key={t}
              href={`/search?q=${t}`}
              onClick={() => dialog.current?.close()}
              className="tag"
            >
              {t}
            </Link>
          ))}
        </div>
        <p className="metadata">Esc to close · Enter to search</p>
      </dialog>
    </header>
  );
}
