import { useSearchParams } from 'react-router-dom';

const FALLBACK_RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

// useRestaurantContext, admin panelin restoran baglamini query string veya env uzerinden belirler.
export function useRestaurantContext() {
  const [searchParams] = useSearchParams();
  const restaurantId =
    searchParams.get('restaurantId') ??
    import.meta.env.VITE_DEFAULT_RESTAURANT_ID ??
    FALLBACK_RESTAURANT_ID;
  const customerBaseUrl = import.meta.env.VITE_CUSTOMER_BASE_URL ?? 'http://localhost:5173';

  return {
    restaurantId,
    customerBaseUrl,
  };
}
