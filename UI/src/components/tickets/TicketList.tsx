'use client';

import { useTickets } from '@/hooks/useTickets';
import { TicketCard } from './TicketCard';
import { Spinner } from '@/components/ui/Spinner';
import type { TicketListProps } from '@/types';

export function TicketList({ query }: TicketListProps) {
  const { data: tickets, isLoading, isError, error } = useTickets(query);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive py-8 text-center text-sm">
        {error instanceof Error ? error.message : 'Error al cargar tickets'}
      </p>
    );
  }

  if (!tickets?.length) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        {query ? 'Sin resultados para esa búsqueda.' : 'No hay tickets disponibles.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.key} ticket={ticket} />
      ))}
    </div>
  );
}
