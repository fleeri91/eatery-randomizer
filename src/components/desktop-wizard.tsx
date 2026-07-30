import { useEffect, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { PlaceFilters } from '@/components/place-filter'
import { LocationSheet } from '@/components/location-sheet'
import { RevealStage } from '@/components/reveal-stage'
import { DesktopResultCard } from '@/components/desktop-result-card'
import { EmptyState } from '@/components/empty-state'
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
  places: Place[] | undefined
  current: Place | null
  eligible: Place[]
  poolSize: number
  onReroll: () => void
  onBlock: (id: string) => void
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

function FiltersPanel({
  onOpenLocation,
  onSubmit,
}: {
  onOpenLocation: () => void
  onSubmit: () => void
}) {
  const location = useFilterStore((s) => s.location)
  const locked = !location

  return (
    <div className="flex w-[640px] max-w-full flex-col border-r border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <p className="font-heading text-2xl font-bold tracking-tight text-primary">
          WHIM
        </p>
      </div>
      <div className="relative flex-1 overflow-y-auto px-6 py-5">
        <div
          style={
            !locked
              ? {
                  animation:
                    'filters-in 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
                }
              : undefined
          }
        >
          <PlaceFilters disabled={locked} />
        </div>

        {locked && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center backdrop-blur-sm"
            style={{ background: 'rgb(28 24 22 / 90%)' }}
          >
            <div className="mb-4 size-14 rotate-45 border border-primary" />
            <p className="font-heading text-xl font-bold tracking-tight text-foreground">
              Where are you?
            </p>
            <p className="mt-2 max-w-60 text-sm text-muted-foreground">
              Whim needs a place to search before you can set the rest. Pick a
              location to unlock the filters.
            </p>
            <button
              type="button"
              onClick={onOpenLocation}
              className="mt-5 bg-primary px-6 py-3.5 font-heading text-sm font-bold tracking-wide text-primary-foreground uppercase"
            >
              Choose a location
            </button>
          </div>
        )}
      </div>

      {!locked && (
        <div className="border-t border-border bg-muted/40 px-6 py-5">
          <button
            type="button"
            onClick={onSubmit}
            className="w-full bg-primary py-4 font-heading text-lg font-bold tracking-[0.04em] text-primary-foreground uppercase"
          >
            Pick for me
          </button>
          <p className="mt-2.5 text-center text-xs text-muted-foreground">
            Whim picks one at random from what fits.
          </p>
        </div>
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
  places,
  current,
  eligible,
  poolSize,
  onReroll,
  onBlock,
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
  const setLocation = useFilterStore((s) => s.setLocation)
  const [locOpen, setLocOpen] = useState(false)
  const [revealPhase, setRevealPhase] = useState<
    'idle' | 'cycling' | 'landed' | 'settled'
  >('idle')
  const unlockTimeout = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(unlockTimeout.current), [])

  function handleLocationSelect(loc: Coordinates, label: string) {
    setLocation(loc, label)
    setLocOpen(false)
  }

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

        {!submitted && (
          <FiltersPanel
            onOpenLocation={() => setLocOpen(true)}
            onSubmit={onSubmit}
          />
        )}

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
                  hasRawResults={(places?.length ?? 0) > 0}
                  ratingLabel={
                    minRating > 0 ? `${minRating.toFixed(1)}+` : null
                  }
                  priceActive={priceActive}
                  onWidenDistance={onWidenDistance}
                  onDropRating={onDropRating}
                  onClearPrice={onClearPrice}
                  onBackToFilters={onBackToFilters}
                  onStartFresh={onStartFresh}
                />
              </div>
            )}

            {!searching && !placesError && poolSize > 0 && (
              <>
                {(revealPhase === 'cycling' || revealPhase === 'landed') && (
                  <p className="mb-6 font-heading text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                    Consulting the whim…
                  </p>
                )}
                <div className="w-[620px] max-w-full">
                  <RevealStage
                    revealKey={current?.id ?? null}
                    candidateLabels={eligible.map((p) => p.name)}
                    targetLabel={current?.name ?? null}
                    onPhaseChange={setRevealPhase}
                  >
                    {current && (
                      <DesktopResultCard
                        place={current}
                        category={category}
                        origin={location}
                        onReroll={onReroll}
                        onBlock={onBlock}
                      />
                    )}
                  </RevealStage>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <LocationSheet
        open={locOpen}
        onOpenChange={setLocOpen}
        onSelect={handleLocationSelect}
      />
    </div>
  )
}
