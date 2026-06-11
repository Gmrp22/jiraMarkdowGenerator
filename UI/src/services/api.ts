import { env } from '@/lib/env';
import type { FetchOptions } from '@/types';

export async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
  const { responseType = 'json', ...fetchOptions } = options ?? {};

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) throw new Error(await res.text());

  return responseType === 'text' ? (res.text() as Promise<T>) : res.json();
}
