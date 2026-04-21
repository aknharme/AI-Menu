type LoadingStateProps = {
  count?: number;
};

export default function LoadingState({ count = 4 }: LoadingStateProps) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm shadow-stone-950/5"
        >
          <div className="space-y-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
            <div className="h-6 w-2/3 animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
