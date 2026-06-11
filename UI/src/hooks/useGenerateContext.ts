import { useMutation } from '@tanstack/react-query';
import { generateContext } from '@/services/tickets.service';

export const useGenerateContext = () =>
  useMutation({
    mutationFn: (ticketIds: string[]) => generateContext(ticketIds),
  });
