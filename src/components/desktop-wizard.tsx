import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { PlaceFilters } from '@/components/place-filter'
import { LocationStep } from '@/components/location-step'
import { LocationDenied } from '@/components/location-denied'
import { RevealStage } from '@/components/reveal-stage'
import { DesktopResultCard } from '@/components/desktop-result-card'
import { EmptyState } from '@/components/empty-state'
import { placeMeta } from '@/lib/place-links'
import { useFilterStore } from '@/stores/filter-store'
import {
  type Category,
  type Coordinates,
  type Place,
} from '@/types/google-places'

interface DesktopWizardProps {
  submitted: boolean
  onSubmit: () => void
  onBackToFilters: () => void
  searching: boolean
  placesError: Error | null
  categoryPoolSize: number
  current: Place | null
  eligible: Place[]
  poolSize: number
  blockedPlaces: Place[]
  allRejected: boolean
  onReroll: () => void
  onBlock: (id: string) => void
  onForgiveAll: () => void
  category: Category
  locationLabel: string
  maxRadiusMeters: number
  radiusMeters: number
  minRating: number
  priceActive: boolean
  onWidenDistance: () => void
  onDropRating: () => void
  onClearPrice: () => void
  onStartFresh: () => void
}

function FiltersPanel({ onSubmit }: { onSubmit: () => void }) {
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

  return (
    <div className="flex w-[640px] max-w-full flex-col border-r border-border bg-card">
      <div className="flex items-baseline justify-between gap-4 border-b border-border px-6 py-4">
        <p className="font-heading text-2xl font-bold tracking-tight text-primary">
          FORKETTE
        </p>
        <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
          Stop deciding. Start eating.
        </p>
      </div>

      {showLocationStep && (
        <LocationStep
          onSelect={handleLocationSelect}
          onDenied={() => setDenied(true)}
        />
      )}

      {showDenied && <LocationDenied onRetry={() => setDenied(false)} />}

      {!showLocationStep && !showDenied && (
        <>
          <div
            className="flex-1 overflow-y-auto px-6 py-5"
            style={{
              animation:
                'filters-in 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
            }}
          >
            <button
              type="button"
              onClick={() => setEditingLocation(true)}
              className="mb-6 flex w-full items-center gap-3 border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary"
            >
              <span className="size-2 shrink-0 animate-pulse rounded-full bg-primary" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {locationLabel}
              </span>
              <span className="shrink-0 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                Change
              </span>
            </button>
            <PlaceFilters disabled={false} />
          </div>

          <div className="border-t border-border bg-muted/40 px-6 py-5">
            <button
              type="button"
              onClick={onSubmit}
              className="w-full bg-primary py-4 font-heading text-lg font-bold tracking-[0.04em] text-primary-foreground uppercase"
            >
              Pick for me
            </button>
            <p className="mt-2.5 text-center text-xs text-muted-foreground">
              Forkette picks one at random from what fits.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export function DesktopWizard({
  submitted,
  onSubmit,
  onBackToFilters,
  searching,
  placesError,
  categoryPoolSize,
  current,
  eligible,
  poolSize,
  blockedPlaces,
  allRejected,
  onReroll,
  onBlock,
  onForgiveAll,
  category,
  locationLabel,
  maxRadiusMeters,
  radiusMeters,
  minRating,
  priceActive,
  onWidenDistance,
  onDropRating,
  onClearPrice,
  onStartFresh,
}: DesktopWizardProps) {
  const location = useFilterStore((s) => s.location)

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <div className="relative flex flex-1 justify-center overflow-hidden bg-background">
        {submitted && (
          <button
            type="button"
            onClick={onBackToFilters}
            className="absolute top-6 left-6 z-10 flex items-center gap-1.5 border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted"
          >
            <ChevronLeft className="size-3.5" /> Back
          </button>
        )}

        {!submitted && <FiltersPanel onSubmit={onSubmit} />}

        {submitted && (
          <div className="flex flex-1 flex-col items-center justify-center bg-background p-10">
            {searching && (
              <p className="animate-pulse font-heading text-lg font-semibold text-muted-foreground">
                Scouting the area…
              </p>
            )}

            {!searching && placesError && (
              <p className="text-sm font-medium text-destructive">
                {placesError.message}
              </p>
            )}

            {!searching && !placesError && poolSize === 0 && (
              <div className="w-[460px] max-w-full">
                <EmptyState
                  category={category}
                  locationLabel={locationLabel}
                  radiusMeters={radiusMeters}
                  maxRadiusMeters={maxRadiusMeters}
                  hasRawResults={categoryPoolSize > 0}
                  ratingLabel={
                    minRating > 0 ? `${minRating.toFixed(1)}+` : null
                  }
                  priceActive={priceActive}
                  allRejected={allRejected}
                  onWidenDistance={onWidenDistance}
                  onDropRating={onDropRating}
                  onClearPrice={onClearPrice}
                  onBackToFilters={onBackToFilters}
                  onStartFresh={onStartFresh}
                  onForgiveAll={onForgiveAll}
                />
              </div>
            )}

            {!searching && !placesError && poolSize > 0 && (
              <div className="w-[620px] max-w-full">
                <RevealStage
                  revealKey={current?.id ?? null}
                  candidates={eligible.map((p) => ({
                    label: p.name,
                    meta: placeMeta(p, location),
                  }))}
                  targetLabel={current?.name ?? null}
                  poolLabel={`${poolSize} place${poolSize === 1 ? '' : 's'} in play`}
                >
                  {current && (
                    <DesktopResultCard
                      place={current}
                      category={category}
                      origin={location}
                      passedOn={blockedPlaces}
                      onReroll={onReroll}
                      onBlock={onBlock}
                    />
                  )}
                </RevealStage>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
