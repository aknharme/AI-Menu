import { useSearchParams } from 'react-router-dom';

// restaurantId ve tableId ileride QR linkinden gelen query paramlarla okunur.
export function useQueryParams() {
  const [searchParams] = useSearchParams();

  return {
    restaurantId: searchParams.get('restaurantId') ?? undefined,
    tableId: searchParams.get('tableId') ?? undefined,
  };
}
