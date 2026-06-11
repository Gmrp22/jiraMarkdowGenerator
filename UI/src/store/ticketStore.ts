import { create } from 'zustand';
import type { TicketStoreState } from '@/types';

export const useTicketStore = create<TicketStoreState>((set) => ({
  selectedTickets: [],

  selectTicket: (ticket) =>
    set((state) => {
      const alreadySelected = state.selectedTickets.some((t) => t.key === ticket.key);
      if (alreadySelected) return state;
      return { selectedTickets: [...state.selectedTickets, ticket] };
    }),

  removeTicket: (key) =>
    set((state) => ({
      selectedTickets: state.selectedTickets.filter((t) => t.key !== key),
    })),

  clearSelection: () => set({ selectedTickets: [] }),
}));
