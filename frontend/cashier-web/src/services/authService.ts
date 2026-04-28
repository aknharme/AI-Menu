import api from './api';
import type { AuthResponse, AuthUser, LoginRequest } from '../types/auth';

// Cashier auth service, login ve oturum dogrulamasini backend auth endpoint'leriyle yapar.
export async function login(request: LoginRequest) {
  const response = await api.post<AuthResponse>('/auth/login', request);
  return response.data;
}

export async function getMe() {
  const response = await api.get<AuthUser>('/auth/me');
  return response.data;
}
