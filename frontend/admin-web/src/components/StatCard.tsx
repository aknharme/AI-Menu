type StatCardProps = {
  label: string;
  value: string;
};

// Dashboard'daki küçük metrik kartları için yeniden kullanılabilir component.
export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
