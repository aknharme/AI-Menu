import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useRestaurantId() {
  const [searchParams] = useSearchParams();

  return useMemo(
    () => searchParams.get('restaurantId') ?? import.meta.env.VITE_RESTAURANT_ID ?? '',
    [searchParams],
  );
}
