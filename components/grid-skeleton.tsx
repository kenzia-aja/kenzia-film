export default function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[2/3] w-full rounded-lg" />
          <div className="skeleton mt-2 h-3.5 w-4/5 rounded" />
          <div className="skeleton mt-1.5 h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
