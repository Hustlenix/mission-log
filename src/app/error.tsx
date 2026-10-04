"use client";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <div className="mx-auto max-w-3xl px-6 py-16"><p className="eyebrow text-accent mb-4">Signal interrupted</p><h1 className="font-display text-4xl font-bold mb-5">Mission control needs a moment.</h1><p className="text-muted mb-7">We couldn’t load this page. Please try again; your saved logs are still in the database.</p><button className="launch-button" onClick={retry}>Try again ↗</button></div>;
}
