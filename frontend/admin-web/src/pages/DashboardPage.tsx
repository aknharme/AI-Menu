import StatCard from '../components/StatCard';

// DashboardPage restoran yönetiminin ilk admin ekranıdır.
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm leading-6 text-gray-600">
          Restoran menüsü, masalar ve sipariş özetleri buradan yönetilecek.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Aktif Ürün" value="0" />
        <StatCard label="Bugünkü Sipariş" value="0" />
        <StatCard label="Açık Masa" value="0" />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">Hızlı İşlemler</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Ürün Ekle
          </button>
          <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            Masa Yönet
          </button>
        </div>
      </section>
    </div>
  );
}
