'use client';

import { useState } from 'react';
import { useTicketStore } from '@/store/ticketStore';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { SelectedPanelProps } from '@/types';

export function SelectedPanel({ markdown, loading = false, onClear }: SelectedPanelProps) {
  const selectedTickets = useTicketStore((state) => state.selectedTickets);
  const removeTicket = useTicketStore((state) => state.removeTicket);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedTickets.length && !markdown) {
    return (
      <p className="text-muted-foreground text-sm">Selecciona un ticket para ver el context.md</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {selectedTickets.map((ticket) => (
          <li key={ticket.key} className="flex items-center gap-2">
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

      {loading && (
        <div className="flex justify-center py-2">
          <Spinner size="sm" />
        </div>
      )}

      {markdown && !loading && (
        <>
          <pre className="border-border bg-background text-foreground max-h-[50vh] overflow-auto rounded-md border p-3 text-xs leading-relaxed whitespace-pre-wrap">
            {markdown}
          </pre>
          <Button onClick={handleCopy} variant="secondary" className="w-full">
            {copied ? '¡Copiado!' : 'Copiar markdown'}
          </Button>
          <Button onClick={onClear} variant="secondary" className="w-full">
            Limpiar selección
          </Button>
        </>
      )}
    </div>
  );
}
