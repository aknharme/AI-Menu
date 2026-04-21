import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardPage from '../pages/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
]);
