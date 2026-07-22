import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationSheet } from '@/components/location-sheet'
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
  const [locOpen, setLocOpen] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const unlockTimeout = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(unlockTimeout.current), [])

  function handleLocationSelect(loc: Coordinates, label: string) {
    const wasUnset = !location
    setLocation(loc, label)
    setLocOpen(false)
    if (wasUnset) {
      setUnlocking(true)
      window.clearTimeout(unlockTimeout.current)
      unlockTimeout.current = window.setTimeout(() => setUnlocking(false), 450)
    }
  }

  const locked = !location

  return (
    <>
      <div className="flex flex-1 flex-col sm:mx-auto sm:w-full sm:max-w-sm sm:flex-none sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border sm:bg-card sm:shadow-[0_30px_60px_-20px_oklch(0.4_0.06_40/0.2)]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="font-heading text-xl font-extrabold tracking-tight text-foreground">
            Whim
          </p>
          <button
            type="button"
            onClick={() => setLocOpen(true)}
            className={cn(
              'flex max-w-[210px] items-center gap-1.5 rounded-full border px-3.5 py-2 transition-colors',
              locked
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:bg-muted'
            )}
          >
            <span
              className={cn(
                'size-3 shrink-0 rotate-[-45deg] rounded-[50%_50%_50%_0]',
                locked ? 'bg-primary-foreground' : 'bg-primary'
              )}
            />
            <span className="truncate text-sm font-bold">
              {locked ? 'Set location' : locationLabel}
            </span>
            <ChevronDown className="size-3.5 shrink-0 opacity-70" />
          </button>
        </div>

        <div className="relative flex flex-1 flex-col sm:flex-none">
          <div
            key={locked ? 'locked' : 'unlocked'}
            className="flex flex-1 flex-col sm:flex-none"
            style={
              !locked
                ? {
                    animation:
                      'filters-in 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
                  }
                : undefined
            }
          >
            <div className="flex-1 px-5 py-5 sm:flex-none sm:px-6">
              <PlaceFilters disabled={locked} />
            </div>

            <div className="border-t border-border bg-muted/40 px-5 py-5 sm:px-6">
              <Button
                className="w-full rounded-2xl py-6 font-heading text-lg font-bold shadow-[0_10px_24px_-6px_oklch(0.66_0.19_32/0.5)]"
                disabled={locked}
                onClick={onSubmit}
              >
                Shuffle the block
              </Button>
              <p className="mt-2.5 text-center text-xs text-muted-foreground">
                Whim picks one at random from what fits.
              </p>
            </div>
          </div>

          {(locked || unlocking) && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center backdrop-blur-sm"
              style={{
                background: 'oklch(0.98 0.02 70 / 0.86)',
                animation: unlocking
                  ? 'lock-fade-out 450ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
                  : undefined,
                pointerEvents: unlocking ? 'none' : 'auto',
              }}
            >
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary">
                <span className="size-6 shrink-0 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-primary" />
              </div>
              <p className="font-heading text-xl font-extrabold tracking-tight text-foreground">
                Where are you?
              </p>
              <p className="mt-2 max-w-[240px] text-sm text-muted-foreground">
                Whim needs a place to search before you can set the rest. Pick a
                location to unlock the filters.
              </p>
              <button
                type="button"
                onClick={() => setLocOpen(true)}
                className="mt-5 rounded-2xl bg-primary px-6 py-3.5 font-heading text-base font-bold text-primary-foreground shadow-[0_10px_24px_-6px_oklch(0.66_0.19_32/0.5)]"
              >
                Choose a location
              </button>
            </div>
          )}
        </div>
      </div>

      <LocationSheet
        open={locOpen}
        onOpenChange={setLocOpen}
        onSelect={handleLocationSelect}
      />
    </>
  )
}
