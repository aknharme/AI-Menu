import { useParams, useSearchParams } from 'react-router-dom';

const DEFAULT_RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';
const DEFAULT_TABLE_ID = '44444444-4444-4444-4444-444444444441';

const TABLE_GUID_MAP: Record<string, string> = {
  '1': '44444444-4444-4444-4444-444444444441',
  '4': '44444444-4444-4444-4444-444444444441',
  '2': '44444444-4444-4444-4444-444444444442',
  '3': '44444444-4444-4444-4444-444444444443',
};

export function useQueryParams() {
  const [searchParams] = useSearchParams();
  const params = useParams();

  const rawRestaurantId = params.restaurantId ?? searchParams.get('restaurantId') ?? DEFAULT_RESTAURANT_ID;
  const restaurantId = rawRestaurantId === '1' ? DEFAULT_RESTAURANT_ID : rawRestaurantId;

  const rawTableId = params.tableId ?? searchParams.get('tableId') ?? DEFAULT_TABLE_ID;
  const tableId = TABLE_GUID_MAP[rawTableId] ?? rawTableId;

  return {
    restaurantId,
    tableId,
  };
}
