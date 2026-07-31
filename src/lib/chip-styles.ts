import { cn } from '@/lib/utils'

export const chipClass = (selected: boolean, disabled: boolean) =>
  cn(
    'border px-3.5 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors disabled:pointer-events-none',
    disabled && 'opacity-50',
    selected
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-border bg-card text-foreground/80 hover:bg-muted'
  )

// Compact chip variant used by the cuisine subtype picker, which needs to
// fit dozens of options in a wrapped grid rather than a handful in a row.
export const chipClassSm = (selected: boolean) =>
  cn(
    'border px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase transition-colors',
    selected
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
  )
