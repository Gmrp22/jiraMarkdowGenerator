import { useAuthStore } from '@/store/authStore';
import { env } from '@/lib/env';
import type { FetchOptions } from '@/types';

export async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
  const { responseType = 'json', ...fetchOptions } = options ?? {};
  const token = useAuthStore.getState().token;

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  if (res.status === 401) useAuthStore.getState().clearToken();
  if (!res.ok) throw new Error(await res.text());

  return responseType === 'text' ? (res.text() as Promise<T>) : res.json();
}
