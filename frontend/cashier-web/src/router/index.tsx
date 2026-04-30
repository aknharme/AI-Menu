import { createBrowserRouter } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import CashierLayout from '../layouts/CashierLayout';
import LoginPage from '../pages/LoginPage';
import OrdersPage from '../pages/OrdersPage';

// Kasiyer uygulamasında ana rota sipariş takip ekranına gider.
export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: <RequireAuth allowedRoles={['Admin', 'Cashier']} />,
      children: [
        {
          path: '/',
          element: <CashierLayout />,
          children: [
            {
              index: true,
              element: <OrdersPage />,
            },
          ],
        },
      ],
    },
  ],
  {
    // Router, Nginx altinda /cashier baz yolundan servis edilmek uzere ayarlanir.
    basename: import.meta.env.BASE_URL,
  },
);
