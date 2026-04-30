import { useParams, useSearchParams } from 'react-router-dom';

const DEFAULT_RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';
const DEFAULT_TABLE_ID = '44444444-4444-4444-4444-444444444441';

export function useQueryParams() {
  const [searchParams] = useSearchParams();
  const params = useParams();

  return {
    restaurantId:
      params.restaurantId ?? searchParams.get('restaurantId') ?? DEFAULT_RESTAURANT_ID,
    tableId: params.tableId ?? searchParams.get('tableId') ?? DEFAULT_TABLE_ID,
  };
}
