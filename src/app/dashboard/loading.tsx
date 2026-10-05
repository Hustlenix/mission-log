export default function LogsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16" aria-busy="true" aria-live="polite">
      <p className="font-mono text-xs text-muted tracking-widest">LOADING YOUR LOGS…</p>
    </div>
  );
}
