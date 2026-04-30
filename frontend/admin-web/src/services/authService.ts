import api from './api';
import type { AuthResponse, AuthUser, LoginRequest } from '../types/auth';

// Auth service, admin panel login ve mevcut kullanici bilgisini backend auth endpoint'lerine baglar.
export async function login(request: LoginRequest) {
  const response = await api.post<AuthResponse>('/auth/login', request);
  return response.data;
}

export async function getMe() {
  const response = await api.get<AuthUser>('/auth/me');
  return response.data;
}
