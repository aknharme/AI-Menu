import { createBrowserRouter } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import MenuPage from '../pages/MenuPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <MenuPage />,
      },
      {
        // QR akisinda kullanilan /menu?restaurantId=... yolu query string ile birlikte desteklenir.
        path: 'menu',
        element: <MenuPage />,
      },
      {
        path: 'menu/:restaurantId',
        element: <MenuPage />,
      },
      {
        path: 'menu/:restaurantId/table/:tableId',
        element: <MenuPage />,
      },
    ],
  },
]);
