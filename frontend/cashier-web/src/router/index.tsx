import { createBrowserRouter } from 'react-router-dom';
import CashierLayout from '../layouts/CashierLayout';
import OrdersPage from '../pages/OrdersPage';

// Kasiyer uygulamasında ana rota sipariş takip ekranına gider.
export const router = createBrowserRouter([
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
]);
