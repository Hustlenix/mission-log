import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
      <p className="font-mono text-xs text-accent tracking-widest mb-6">404</p>
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">SIGNAL LOST</h1>
      <p className="text-muted text-lg mb-10">
        The transmission you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-accent text-background font-mono text-sm font-semibold px-6 py-3 hover:bg-accent-dim transition-colors"
      >
        RETURN TO MISSION CONTROL
      </Link>
    </div>
  );
}
