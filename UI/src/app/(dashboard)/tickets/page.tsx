'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/tickets/SearchBar';
import { TicketList } from '@/components/tickets/TicketList';
import { SelectedPanel } from '@/components/tickets/SelectedPanel';
import { useGenerateContext } from '@/hooks/useGenerateContext';
import { useAuth } from '@/hooks/useAuth';
import { formatError } from '@/lib/formatError';
import { useTicketStore } from '@/store/ticketStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function TicketsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const selectedTickets = useTicketStore((state) => state.selectedTickets);
  const clearSelection = useTicketStore((state) => state.clearSelection);

  const [query, setQuery] = useState('');
  const [markdown, setMarkdown] = useState<string | undefined>();
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { mutate: generate, isPending } = useGenerateContext();

  // genera automáticamente cada vez que cambia la selección
  // generate (mutate) es estable entre renders — React Query lo garantiza
  useEffect(() => {
    if (selectedTickets.length === 0) return;
    generate(
      selectedTickets.map((t) => t.key),
      {
        onSuccess: (result: string) => setMarkdown(result),
        onError: (err: unknown) => {
          setErrorMessage(formatError(err));
          setErrorModal(true);
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTickets]);

  // markdown visible solo si hay tickets seleccionados
  const displayMarkdown = selectedTickets.length > 0 ? markdown : undefined;

  const handleClear = () => {
    clearSelection();
    setMarkdown(undefined);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-foreground text-lg font-semibold">Ticket Generator</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">{user?.email}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <SearchBar onSearch={setQuery} />
            <TicketList query={query} />
          </div>

          <aside className="bg-card border-border rounded-lg border p-4">
            <h2 className="text-foreground mb-4 text-sm font-semibold">
              {displayMarkdown ? 'context.md' : 'Seleccionados'}
            </h2>
            <SelectedPanel markdown={displayMarkdown} loading={isPending} onClear={handleClear} />
          </aside>
        </div>
      </main>

      <Modal open={errorModal} onClose={() => setErrorModal(false)} title="Error">
        {errorMessage}
      </Modal>
    </div>
  );
}
