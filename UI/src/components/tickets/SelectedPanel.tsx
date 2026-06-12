'use client';

import { useTicketStore } from '@/store/ticketStore';
import { Button } from '@/components/ui/Button';
import type { SelectedPanelProps } from '@/types';

export function SelectedPanel({ onGenerate, loading = false }: SelectedPanelProps) {
  const selectedTickets = useTicketStore((state) => state.selectedTickets);
  const removeTicket = useTicketStore((state) => state.removeTicket);

  if (!selectedTickets.length) {
    return (
      <p className="text-muted-foreground text-sm">Selecciona tickets para generar el context.md</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {selectedTickets.map((ticket) => (
          <li key={ticket.key} className="flex items-center justify-between gap-2">
            <span className="text-foreground font-mono text-sm">{ticket.key}</span>
            <span className="text-muted-foreground truncate text-xs">{ticket.summary}</span>
            <button
              onClick={() => removeTicket(ticket.key)}
              className="text-muted-foreground hover:text-destructive ml-auto shrink-0 text-xs transition-colors"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <Button
        loading={loading}
        onClick={() => onGenerate(selectedTickets.map((t) => t.key))}
        className="w-full"
      >
        Generar context.md ({selectedTickets.length})
      </Button>
    </div>
  );
}
