import type { BadgeProps } from '@/types';

const statusColors: Record<string, string> = {
  'To Do': 'bg-secondary text-secondary-foreground',
  'In Progress': 'bg-primary/20 text-primary',
  Done: 'bg-green-500/20 text-green-400',
  Blocked: 'bg-destructive/20 text-destructive',
};

export function Badge({ label }: BadgeProps) {
  const colorClass = statusColors[label] ?? 'bg-secondary text-secondary-foreground';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}
