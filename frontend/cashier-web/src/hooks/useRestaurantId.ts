import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStoredUser } from '../services/authStorage';

export function useRestaurantId() {
  const [searchParams] = useSearchParams();
  const user = getStoredUser();

  return useMemo(
    () => user?.restaurantId ?? searchParams.get('restaurantId') ?? import.meta.env.VITE_RESTAURANT_ID ?? '',
    [searchParams, user?.restaurantId],
  );
}
