import { apiFetch } from './api';
import type { User } from '@/types';

export const login = (email: string, password: string) =>
  apiFetch<{ user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (email: string, password: string) =>
  apiFetch<{ user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logout = () => apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
