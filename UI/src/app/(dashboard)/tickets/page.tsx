'use client';

import { useState } from 'react';
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
  const clearSelection = useTicketStore((state) => state.clearSelection);

  const [query, setQuery] = useState('');
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { mutate: generate, isPending } = useGenerateContext();

  const handleGenerate = (ticketIds: string[]) => {
    generate(ticketIds, {
      onSuccess: (markdown) => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'context.md';
        a.click();
        URL.revokeObjectURL(url);
        clearSelection();
      },
      onError: (err) => {
        setErrorMessage(formatError(err));
        setErrorModal(true);
      },
    });
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
            <h2 className="text-foreground mb-4 text-sm font-semibold">Seleccionados</h2>
            <SelectedPanel onGenerate={handleGenerate} loading={isPending} />
          </aside>
        </div>
      </main>

      <Modal open={errorModal} onClose={() => setErrorModal(false)} title="Error">
        {errorMessage}
      </Modal>
    </div>
  );
}
