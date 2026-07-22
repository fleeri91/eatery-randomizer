import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { StartScreen } from './views/start-screen'
import { useNearbyPlaces } from './lib/queries'
import { CATEGORY_LABELS } from './types/google-places'
import { useRandomizer } from './hooks/use-randomizer'
import { RevealStage } from './components/reveal-stage'
import { ResultCard } from './components/result-card'
import { EmptyState } from './components/empty-state'
import { useFilterStore, MAX_RADIUS_METERS } from './stores/filter-store'

export default function App() {
  const [submitted, setSubmitted] = useState(false)
  const location = useFilterStore((s) => s.location)
  const locationLabel = useFilterStore((s) => s.locationLabel)
  const filters = useFilterStore((s) => s.filters)
  const setRadiusMeters = useFilterStore((s) => s.setRadiusMeters)
  const setMinRating = useFilterStore((s) => s.setMinRating)
  const clearPriceLevels = useFilterStore((s) => s.clearPriceLevels)
  const resetFilters = useFilterStore((s) => s.reset)

  const {
    data: places,
    isLoading: searching,
    error: placesError,
  } = useNearbyPlaces(
    submitted ? (location ?? undefined) : undefined,
    filters.category,
    filters.radiusMeters
  )

  const { current, randomize, block, poolSize, eligible } = useRandomizer(
    places,
    filters.minRating,
    filters.priceLevels
  )

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background sm:items-center sm:justify-center sm:p-6">
      {!submitted && <StartScreen onSubmit={() => setSubmitted(true)} />}

      {submitted && searching && (
        <div className="flex flex-1 items-center justify-center p-6 sm:contents">
          <p className="animate-pulse font-heading text-lg font-semibold text-muted-foreground">
            Scouting the area…
          </p>
        </div>
      )}

      {submitted && placesError && (
        <div className="flex flex-1 items-center justify-center p-6 sm:contents">
          <p className="text-sm font-medium text-destructive">
            {placesError.message}
          </p>
        </div>
      )}

      {submitted && places && (
        <div className="flex flex-1 flex-col sm:w-full sm:max-w-sm sm:flex-none sm:gap-4">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:border-b-0 sm:px-1 sm:py-0">
            <button
              type="button"
              aria-label="Back to filters"
              onClick={() => setSubmitted(false)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="font-heading text-base leading-tight font-extrabold text-foreground">
                Whim
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {CATEGORY_LABELS[filters.category]} · within{' '}
                {(filters.radiusMeters / 1000).toFixed(1)} km · {poolSize} place
                {poolSize === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col sm:contents">
            {poolSize === 0 ? (
              <EmptyState
                category={filters.category}
                locationLabel={locationLabel}
                radiusMeters={filters.radiusMeters}
                maxRadiusMeters={MAX_RADIUS_METERS}
                hasRawResults={places.length > 0}
                ratingLabel={
                  filters.minRating > 0
                    ? `${filters.minRating.toFixed(1)}+`
                    : null
                }
                priceActive={filters.priceLevels.size > 0}
                onWidenDistance={() => setRadiusMeters(MAX_RADIUS_METERS)}
                onDropRating={() => setMinRating(0)}
                onClearPrice={clearPriceLevels}
                onBackToFilters={() => setSubmitted(false)}
                onStartFresh={() => {
                  resetFilters()
                  setSubmitted(false)
                }}
              />
            ) : (
              <div className="flex flex-1 flex-col justify-center px-4 py-4 sm:contents">
                <RevealStage
                  revealKey={current?.id ?? null}
                  candidateLabels={eligible.map((p) => p.name)}
                  targetLabel={current?.name ?? null}
                >
                  {current && (
                    <ResultCard
                      place={current}
                      category={filters.category}
                      onReroll={randomize}
                      onBlock={block}
                    />
                  )}
                </RevealStage>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
