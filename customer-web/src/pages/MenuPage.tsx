import MenuList from '../components/MenuList';
import { useQueryParams } from '../hooks/useQueryParams';

// MenuPage müşteri tarafının ana sayfasıdır ve QR'dan gelen parametreleri menüye iletir.
export default function MenuPage() {
  const { restaurantId, tableId } = useQueryParams();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Bugünün Menüsü</h2>
        <p className="text-sm leading-6 text-gray-600">
          Ürünleri inceleyin, siparişe eklemek istediklerinizi seçin.
        </p>
      </section>

      <MenuList restaurantId={restaurantId} tableId={tableId} />
    </div>
  );
}
