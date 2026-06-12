'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import type { SearchBarProps } from '@/types';

export function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <Input
      id="search"
      type="text"
      placeholder="Buscar por clave o keyword (ej. KAN-1, auth, bug...)"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
