type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

// Dashboard'daki küçük metrik kartları için yeniden kullanılabilir component.
export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-950/5">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-stone-950">{value}</p>
      {hint ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">{hint}</p> : null}
    </div>
  );
}
