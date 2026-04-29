// Shared skeleton primitives for loading.tsx boundaries.
export function CardSkeleton({ big = false }: { big?: boolean }) {
  return (
    <div
      className="skeleton"
      style={{ height: big ? 540 : 420, width: "100%" }}
      aria-hidden
    />
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} big={i === 0 || i === 5} />
      ))}
    </div>
  );
}

export function TextLineSkeleton({
  width = "100%",
  height = 14,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{ width, height, ...style }}
      aria-hidden
    />
  );
}
