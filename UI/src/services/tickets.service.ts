import { apiFetch } from './api';
import type { Ticket } from '@/types';

export const getTickets = () => apiFetch<Ticket[]>('/tickets');

export const searchTickets = (query: string) =>
  apiFetch<Ticket[]>(`/tickets/search?q=${encodeURIComponent(query)}`);

export const generateContext = (ticketIds: string[]) =>
  apiFetch<string>('/context', {
    method: 'POST',
    body: JSON.stringify({ ticketIds }),
    responseType: 'text',
  });
