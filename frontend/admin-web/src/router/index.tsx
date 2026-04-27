import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import CategoriesPage from '../pages/CategoriesPage';
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import TablesPage from '../pages/TablesPage';

// Admin uygulamasında ana rota dashboard sayfasını render eder.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'tables',
        element: <TablesPage />,
      },
    ],
  },
]);
