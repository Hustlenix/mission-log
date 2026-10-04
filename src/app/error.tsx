"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto max-w-3xl px-6 py-16"><p className="font-mono text-xs text-accent tracking-widest mb-4">SIGNAL INTERRUPTED</p><h1 className="font-display text-4xl font-bold mb-5">Mission control needs a moment.</h1><p className="text-muted mb-7">We couldn't load this page. Please try again; your saved logs are still in the database.</p><button className="bg-accent text-background font-mono text-sm font-semibold px-6 py-3 hover:bg-accent-dim transition-colors" onClick={reset}>Try again</button></div>;
}
