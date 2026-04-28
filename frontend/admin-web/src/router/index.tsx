import { createBrowserRouter } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../layouts/AdminLayout';
import CategoriesPage from '../pages/CategoriesPage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import ProductsPage from '../pages/ProductsPage';
import TablesPage from '../pages/TablesPage';

// Admin uygulamasında ana rota dashboard sayfasını render eder.
export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: <RequireAuth allowedRoles={['Admin']} />,
      children: [
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
      ],
    },
  ],
  {
    // Router, Nginx altinda /admin baz yolundan servis edilmek uzere ayarlanir.
    basename: import.meta.env.BASE_URL,
  },
);
