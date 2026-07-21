import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { StartScreen } from './views/start-screen'
import { useNearbyPlaces } from './lib/queries'
import {
  CATEGORY_LABELS,
  EMPTY_PRICE_LEVELS,
  type Coordinates,
  type PlaceFilterValues,
} from './types/google-places'
import { useRandomizer } from './hooks/use-randomizer'
import { RevealStage } from './components/reveal-stage'
import { ResultCard } from './components/result-card'

export default function App() {
  const [submitted, setSubmitted] = useState<{
    location: Coordinates
    filters: PlaceFilterValues
  } | null>(null)

  const {
    data: places,
    isLoading: searching,
    error: placesError,
  } = useNearbyPlaces(
    submitted?.location,
    submitted?.filters.category ?? 'cafe',
    submitted?.filters.radiusMeters
  )

  const { current, randomize, block, poolSize, eligible } = useRandomizer(
    places,
    submitted?.filters.minRating ?? 0,
    submitted?.filters.priceLevels ?? EMPTY_PRICE_LEVELS
  )

  function handleSubmit(location: Coordinates, filters: PlaceFilterValues) {
    setSubmitted({ location, filters })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {!submitted && <StartScreen onSubmit={handleSubmit} />}

      {submitted && searching && (
        <p className="animate-pulse font-heading text-lg font-semibold text-muted-foreground">
          Scouting the area…
        </p>
      )}

      {submitted && placesError && (
        <p className="text-sm font-medium text-destructive">
          {placesError.message}
        </p>
      )}

      {submitted && places && (
        <div className="w-full max-w-sm space-y-4">
          <div className="flex items-center gap-3 px-1">
            <button
              type="button"
              aria-label="Back to filters"
              onClick={() => setSubmitted(null)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="font-heading text-base leading-tight font-extrabold text-foreground">
                Whim
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {CATEGORY_LABELS[submitted.filters.category]} · within{' '}
                {(submitted.filters.radiusMeters / 1000).toFixed(1)} km ·{' '}
                {poolSize} place{poolSize === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <RevealStage
            revealKey={current?.id ?? null}
            candidateLabels={eligible.map((p) => p.name)}
            targetLabel={current?.name ?? null}
          >
            {current && (
              <ResultCard
                place={current}
                category={submitted.filters.category}
                onReroll={randomize}
                onBlock={block}
              />
            )}
          </RevealStage>
        </div>
      )}
    </div>
  )
}
