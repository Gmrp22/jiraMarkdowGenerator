export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  user: User;
}

export interface Ticket {
  id: string;
  key: string;
  summary: string;
  description: string | null;
  status: string;
  type: string;
  assignee: string | null;
}

export interface ContextRequest {
  ticketIds: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  initFromServer: () => Promise<void>;
}

export type FetchOptions = RequestInit & { responseType?: 'json' | 'text' };

export interface TicketStoreState {
  selectedTickets: Ticket[];
  selectTicket: (ticket: Ticket) => void;
  removeTicket: (key: string) => void;
  clearSelection: () => void;
}
