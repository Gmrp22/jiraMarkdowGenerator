'use client';

import { useTicketStore } from '@/store/ticketStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { TicketCardProps } from '@/types';

export function TicketCard({ ticket }: TicketCardProps) {
  const selectedTickets = useTicketStore((state) => state.selectedTickets);
  const selectTicket = useTicketStore((state) => state.selectTicket);
  const removeTicket = useTicketStore((state) => state.removeTicket);

  const isSelected = selectedTickets.some((t) => t.key === ticket.key);

  return (
    <div className="bg-card border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs">{ticket.key}</span>
          <p className="text-foreground text-sm leading-snug font-medium">{ticket.summary}</p>
        </div>
        <Button
          variant={isSelected ? 'danger' : 'secondary'}
          className="shrink-0 text-xs"
          onClick={() => (isSelected ? removeTicket(ticket.key) : selectTicket(ticket))}
        >
          {isSelected ? 'Quitar' : 'Seleccionar'}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge label={ticket.status} />
        <Badge label={ticket.type} />
        {ticket.assignee && (
          <span className="text-muted-foreground text-xs">{ticket.assignee}</span>
        )}
      </div>
    </div>
  );
}
