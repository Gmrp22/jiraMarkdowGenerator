'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import type { ModalProps } from '@/types';
import { Button } from './Button';

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-card w-full max-w-md rounded-lg p-6 shadow-xl">
          <DialogTitle className="text-foreground mb-4 text-lg font-semibold">{title}</DialogTitle>
          <div className="text-secondary-foreground text-sm">{children}</div>
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
