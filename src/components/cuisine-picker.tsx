import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
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

  const options = CATEGORY_SUBTYPES[category].filter((t) =>
    subtypeLabel(t).includes(query.trim().toLowerCase())
  )
  const countLabel = subtypes.size
    ? `${subtypes.size} selected`
    : `Any ${CATEGORY_LABELS[category].toLowerCase()}`

  function handleOpenChange(next: boolean) {
    if (!next) setQuery('')
    onOpenChange(next)
  }

  const searchAndChips = (
    <>
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
        onClick={() => handleOpenChange(false)}
        className="shrink-0 bg-primary py-4 text-center font-heading text-sm font-bold tracking-[0.16em] text-primary-foreground uppercase"
      >
        Apply
      </button>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[80vh] w-[560px] max-w-[calc(100%-64px)] flex-col gap-0 rounded-none border-primary bg-card p-0 ring-0 sm:max-w-[560px]"
        >
          <DialogHeader className="flex-row items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                Cuisine
              </p>
              <DialogTitle className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">
                {countLabel}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="shrink-0 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground"
            >
              Close
            </button>
          </DialogHeader>
          {searchAndChips}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[80dvh] gap-0 rounded-none border-primary bg-card">
        <DrawerHeader className="flex-row items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              Cuisine
            </p>
            <DrawerTitle className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">
              {countLabel}
            </DrawerTitle>
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="shrink-0 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground"
          >
            Close
          </button>
        </DrawerHeader>
        {searchAndChips}
      </DrawerContent>
    </Drawer>
  )
}
