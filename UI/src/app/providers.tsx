'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      })
  );

  const initFromServer = useAuthStore((state) => state.initFromServer);

  useEffect(() => {
    initFromServer();
  }, [initFromServer]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
