import { apiFetch } from './api';
import type { Ticket } from '@/types';

export const getTickets = () =>
  apiFetch<{ tickets: Ticket[] }>('/tickets').then((res) => res.tickets);

export const searchTickets = (query: string) =>
  apiFetch<{ tickets: Ticket[] }>(`/tickets/search?q=${encodeURIComponent(query)}`).then(
    (res) => res.tickets
  );

export const generateContext = (ticketIds: string[]) =>
  apiFetch<string>('/context', {
    method: 'POST',
    body: JSON.stringify({ ticketIds }),
    responseType: 'text',
  });
