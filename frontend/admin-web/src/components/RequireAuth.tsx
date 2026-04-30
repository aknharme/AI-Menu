import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getStoredUser } from '../services/authStorage';

type RequireAuthProps = {
  allowedRoles: string[];
};

// RequireAuth, login olmayan veya rolu uyusmayan kullanicilari panel disina yonlendirir.
export default function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
