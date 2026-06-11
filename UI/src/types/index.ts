export interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  initFromCookie: () => void;
}

export type FetchOptions = RequestInit & { responseType?: 'json' | 'text' };
