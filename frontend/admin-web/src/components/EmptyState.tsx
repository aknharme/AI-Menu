type EmptyStateProps = {
  title: string;
  description: string;
};

// EmptyState, veri gelmediginde admin panelde tek tip fallback mesaj gosterir.
export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center">
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
    </div>
  );
}
