/** Прямоугольник-плейсхолдер с пульсацией для состояний загрузки. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink/10 ${className}`} />;
}

/** Сетка карточек-заглушек для списков (афиша, хроники, галерея). */
export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 px-5 py-10 sm:grid-cols-2 md:px-12 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
