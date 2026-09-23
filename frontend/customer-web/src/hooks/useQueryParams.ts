import { useMatch, useSearchParams } from 'react-router-dom';

const DEFAULT_RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';
const DEFAULT_TABLE_ID = '44444444-4444-4444-4444-444444444441';

export function useQueryParams() {
  const [searchParams] = useSearchParams();
  // Layout da alt rota ile aynı restoran/masa bağlamını kullanmalı.
  const tableMatch = useMatch('/menu/:restaurantId/table/:tableId');
  const restaurantMatch = useMatch('/menu/:restaurantId');
  const params: { restaurantId?: string; tableId?: string } = tableMatch?.params ?? restaurantMatch?.params ?? {};

  return {
    restaurantId:
      params.restaurantId ?? searchParams.get('restaurantId') ?? DEFAULT_RESTAURANT_ID,
    tableId: params.tableId ?? searchParams.get('tableId') ?? DEFAULT_TABLE_ID,
  };
}
