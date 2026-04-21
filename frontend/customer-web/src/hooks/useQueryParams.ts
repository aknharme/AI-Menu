import { useParams, useSearchParams } from 'react-router-dom';

export function useQueryParams() {
  const [searchParams] = useSearchParams();
  const params = useParams();

  return {
    restaurantId:
      params.restaurantId ?? searchParams.get('restaurantId') ?? undefined,
    tableId: params.tableId ?? searchParams.get('tableId') ?? undefined,
  };
}
