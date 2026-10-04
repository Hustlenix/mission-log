export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 bg-surface-raised rounded" />
        <div className="h-10 w-2/3 bg-surface-raised rounded" />
        <div className="h-6 w-1/2 bg-surface-raised rounded" />
        <div className="h-64 w-full bg-surface-raised rounded" />
      </div>
    </div>
  );
}
