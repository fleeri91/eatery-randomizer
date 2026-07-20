import { useState } from 'react'
import { StartScreen } from './views/start-screen'
import { useCityLocation, useNearbyPlaces } from './lib/queries'
import { type PlaceFilterValues } from './types/google-places'
import { useRandomizer } from './hooks/use-randomizer'
import { RevealStage } from './components/reveal-stage'
import { ResultCard } from './components/result-card'
import { Button } from './components/ui/button'

export default function App() {
  const [submitted, setSubmitted] = useState<{
    city: string
    filters: PlaceFilterValues
  } | null>(null)

  const {
    data: location,
    isLoading: geocoding,
    error: geoError,
  } = useCityLocation(submitted?.city ?? '')

  const {
    data: places,
    isLoading: searching,
    error: placesError,
  } = useNearbyPlaces(
    location,
    submitted?.filters.category ?? 'cafe',
    submitted?.filters.radiusMeters
  )

  const { current, randomize, block, poolSize, eligible } = useRandomizer(
    places,
    submitted?.filters.minRating ?? 0
  )

  function handleSubmit(city: string, filters: PlaceFilterValues) {
    setSubmitted({ city, filters })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {!submitted && <StartScreen onSubmit={handleSubmit} />}

      {submitted && (geocoding || searching) && (
        <p className="animate-pulse font-heading text-lg font-semibold text-muted-foreground">
          Scouting the area…
        </p>
      )}

      {submitted && (geoError || placesError) && (
        <p className="text-sm font-medium text-destructive">
          {(geoError ?? placesError)?.message}
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
