import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationStep } from '@/components/location-step'
import { LocationDenied } from '@/components/location-denied'
import { PlaceFilters } from '@/components/place-filter'
import { cn } from '@/lib/utils'
import { useFilterStore } from '@/stores/filter-store'
import { type Coordinates } from '@/types/google-places'

interface StartScreenProps {
  onSubmit: () => void
}

export function StartScreen({ onSubmit }: StartScreenProps) {
  const location = useFilterStore((s) => s.location)
  const locationLabel = useFilterStore((s) => s.locationLabel)
  const setLocation = useFilterStore((s) => s.setLocation)
  const [editingLocation, setEditingLocation] = useState(false)
  const [denied, setDenied] = useState(false)

  const locked = !location
  const showLocationStep = (locked || editingLocation) && !denied
  const showDenied = (locked || editingLocation) && denied

  function handleLocationSelect(loc: Coordinates, label: string) {
    setLocation(loc, label)
    setEditingLocation(false)
    setDenied(false)
  }

  function openLocationEditor() {
    setEditingLocation(true)
    setDenied(false)
  }

  return (
    <div className="flex flex-1 flex-col sm:mx-auto sm:w-full sm:max-w-sm sm:flex-none sm:border sm:border-border sm:bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="font-heading text-xl font-bold tracking-tight text-primary">
          FORKETTE
        </p>
        <button
          type="button"
          onClick={openLocationEditor}
          className={cn(
            'flex max-w-[210px] items-center gap-1.5 border px-3.5 py-2 transition-colors',
            locked
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-foreground hover:bg-muted'
          )}
        >
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              locked ? 'bg-primary-foreground' : 'bg-primary animate-pulse'
            )}
          />
          <span className="truncate text-xs font-bold tracking-wide uppercase">
            {locked ? 'Set location' : locationLabel}
          </span>
          <ChevronDown className="size-3.5 shrink-0 opacity-70" />
        </button>
      </div>

      {showLocationStep && (
        <LocationStep onSelect={handleLocationSelect} onDenied={() => setDenied(true)} />
      )}

      {showDenied && <LocationDenied onRetry={() => setDenied(false)} />}

      {!showLocationStep && !showDenied && (
        <div
          key="filters"
          className="flex flex-1 flex-col sm:flex-none"
          style={{
            animation: 'filters-in 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
          }}
        >
          <div className="flex-1 px-5 py-5 sm:flex-none sm:px-6">
            <PlaceFilters disabled={false} />
          </div>

          <div className="border-t border-border bg-muted/40 px-5 py-5 sm:px-6">
            <Button
              className="w-full py-6 font-heading text-lg font-bold tracking-[0.04em] uppercase"
              onClick={onSubmit}
            >
              Pick for me
            </Button>
            <p className="mt-2.5 text-center text-xs text-muted-foreground">
              Forkette picks one at random from what fits.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
