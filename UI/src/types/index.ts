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

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export interface BadgeProps {
  label: string;
}

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface LoginFormProps {
  onSuccess?: () => void;
}

export interface TicketCardProps {
  ticket: Ticket;
}

export interface TicketListProps {
  query?: string;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
}

export interface SelectedPanelProps {
  markdown?: string;
  loading?: boolean;
  onClear: () => void;
}
