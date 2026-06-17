'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTicketStore } from '@/store/ticketStore';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { SelectedPanelProps, ViewMode } from '@/types';

export function SelectedPanel({ markdown, loading = false, onClear }: SelectedPanelProps) {
  const selectedTickets = useTicketStore((state) => state.selectedTickets);
  const removeTicket = useTicketStore((state) => state.removeTicket);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('raw');

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
          <div className="flex gap-1 self-end">
            <button
              onClick={() => setViewMode('raw')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                viewMode === 'raw'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Raw
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                viewMode === 'preview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
          </div>

          {viewMode === 'raw' ? (
            <pre className="border-border bg-background text-foreground max-h-[50vh] overflow-auto rounded-md border p-3 text-xs leading-relaxed whitespace-pre-wrap">
              {markdown}
            </pre>
          ) : (
            <div className="prose prose-sm prose-invert border-border bg-background max-h-[50vh] overflow-auto rounded-md border p-3">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          )}

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
