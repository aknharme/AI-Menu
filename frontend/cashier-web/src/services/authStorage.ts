import type { AuthResponse, AuthUser } from '../types/auth';

const AUTH_STORAGE_KEY = 'aimenu_cashier_auth';

// Cashier panel oturumu localStorage'da tutulur; sayfa yenilense bile kullanici kalir.
export function storeAuthSession(session: AuthResponse) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredAuthSession(): AuthResponse | null {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthResponse;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function getStoredToken() {
  return getStoredAuthSession()?.token ?? null;
}

export function getStoredUser(): AuthUser | null {
  return getStoredAuthSession()?.user ?? null;
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
