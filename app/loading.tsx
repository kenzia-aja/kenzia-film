export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-24">
      <div className="skeleton mb-8 h-48 w-full rounded-xl" />
      <div className="skeleton mb-3 h-5 w-44 rounded" />
      <div className="flex gap-4 overflow-hidden pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-32 shrink-0 sm:w-36">
            <div className="skeleton aspect-[2/3] w-full rounded-lg" />
            <div className="skeleton mt-2 h-3.5 w-4/5 rounded" />
          </div>
        ))}
      </div>
      <div className="skeleton mb-3 mt-12 h-5 w-52 rounded" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[2/3] w-full rounded-lg" />
            <div className="skeleton mt-2 h-3.5 w-4/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
