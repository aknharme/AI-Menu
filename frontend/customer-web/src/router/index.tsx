import { createBrowserRouter } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import MenuPage from '../pages/MenuPage';

// Customer uygulamasında ana rota doğrudan menü sayfasına gider.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <MenuPage />,
      },
    ],
  },
]);
