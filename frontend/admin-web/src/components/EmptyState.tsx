type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center shadow-sm shadow-stone-950/5">
      <h3 className="text-lg font-semibold text-stone-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-500">{description}</p>
    </div>
  );
}
