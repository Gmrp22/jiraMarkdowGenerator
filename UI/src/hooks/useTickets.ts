import { useQuery } from '@tanstack/react-query';
import { getTickets, searchTickets } from '@/services/tickets.service';

export const useTickets = (query?: string) =>
  useQuery({
    queryKey: ['tickets', query],
    queryFn: () => (query ? searchTickets(query) : getTickets()),
    staleTime: 5 * 60 * 1000,

  });
