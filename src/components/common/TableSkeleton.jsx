export default function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className="h-4 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
