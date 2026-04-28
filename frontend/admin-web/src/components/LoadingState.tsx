type LoadingStateProps = {
  count?: number;
};

// LoadingState, admin liste ekranlarinda sade iskelet gorunumu saglar.
export default function LoadingState({ count = 4 }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-[24px] border border-stone-200 bg-stone-100"
        />
      ))}
    </div>
  );
}
