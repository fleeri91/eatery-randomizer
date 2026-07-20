import { useState } from 'react'
import { StartScreen } from './views/start-screen'
import { useNearbyPlaces } from './lib/queries'
import {
  EMPTY_PRICE_LEVELS,
  type Coordinates,
  type PlaceFilterValues,
} from './types/google-places'
import { useRandomizer } from './hooks/use-randomizer'
import { RevealStage } from './components/reveal-stage'
import { ResultCard } from './components/result-card'
import { Button } from './components/ui/button'

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
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm text-muted-foreground">
              {poolSize} place{poolSize === 1 ? '' : 's'} match your filters.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={randomize}
              disabled={poolSize === 0}
            >
              🎲 Shuffle
            </Button>
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
