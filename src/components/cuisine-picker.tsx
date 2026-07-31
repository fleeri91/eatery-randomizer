import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/input'
import { chipClassSm } from '@/lib/chip-styles'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useFilterStore } from '@/stores/filter-store'
import {
  CATEGORY_LABELS,
  CATEGORY_SUBTYPES,
  subtypeLabel,
  type Category,
} from '@/types/google-places'

interface CuisinePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category
}

export function CuisinePicker({
  open,
  onOpenChange,
  category,
}: CuisinePickerProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const subtypes = useFilterStore((s) => s.filters.subtypes)
  const toggleSubtype = useFilterStore((s) => s.toggleSubtype)
  const clearSubtypes = useFilterStore((s) => s.clearSubtypes)
  const [query, setQuery] = useState('')

  if (!open) return null

  const options = CATEGORY_SUBTYPES[category].filter((t) =>
    subtypeLabel(t).includes(query.trim().toLowerCase())
  )
  const countLabel = subtypes.size
    ? `${subtypes.size} selected`
    : `Any ${CATEGORY_LABELS[category].toLowerCase()}`

  function close() {
    setQuery('')
    onOpenChange(false)
  }

  const content = (
    <>
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-[9px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Cuisine
          </p>
          <p className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">
            {countLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          className="shrink-0 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="flex items-center gap-3 border-y border-border px-6 py-3.5">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cuisines…"
          autoComplete="off"
          className="h-auto border-0 bg-transparent p-0 font-semibold text-sm text-foreground focus-visible:ring-0"
        />
        {subtypes.size > 0 && (
          <button
            type="button"
            onClick={() => clearSubtypes()}
            className="shrink-0 text-[10px] font-semibold tracking-[0.14em] text-primary uppercase"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-wrap content-start gap-1.5 overflow-y-auto px-6 py-4">
        {options.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleSubtype(type)}
            className={chipClassSm(subtypes.has(type))}
          >
            {subtypeLabel(type)}
          </button>
        ))}
        {options.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">
            No cuisines match "{query}"
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={close}
        className="shrink-0 bg-primary py-4 text-center font-heading text-sm font-bold tracking-[0.16em] text-primary-foreground uppercase"
      >
        Apply
      </button>
    </>
  )

  if (isDesktop) {
    return createPortal(
      <>
        <div
          aria-hidden
          onClick={close}
          className="fixed inset-0 z-40 bg-foreground/40"
        />
        <div
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-[560px] max-w-[calc(100%-64px)] flex-col border border-primary bg-card"
          style={{
            transform: 'translate(-50%, -50%)',
            animation: 'modal-in 220ms cubic-bezier(0.16, 0.84, 0.28, 1)',
          }}
        >
          {content}
        </div>
      </>,
      document.body
    )
  }

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={close}
        className="fixed inset-0 z-40 bg-foreground/40"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[78%] w-full max-w-sm flex-col border-t border-primary bg-card"
        style={{ animation: 'sheet-in 280ms cubic-bezier(0.16, 0.84, 0.28, 1)' }}
      >
        {content}
      </div>
    </>,
    document.body
  )
}
