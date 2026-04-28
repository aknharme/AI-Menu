import { useSearchParams } from 'react-router-dom';
import { getStoredUser } from '../services/authStorage';

const FALLBACK_RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

// useRestaurantContext, admin panelin restoran baglamini query string veya env uzerinden belirler.
export function useRestaurantContext() {
  const [searchParams] = useSearchParams();
  const user = getStoredUser();
  const restaurantId =
    user?.restaurantId ??
    searchParams.get('restaurantId') ??
    import.meta.env.VITE_DEFAULT_RESTAURANT_ID ??
    FALLBACK_RESTAURANT_ID;
  const customerBaseUrl =
    import.meta.env.VITE_CUSTOMER_BASE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

  return {
    restaurantId,
    customerBaseUrl,
  };
}
