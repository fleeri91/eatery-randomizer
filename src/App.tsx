import { useState } from 'react'
import { StartScreen } from './views/start-screen'
import { useCityLocation, useNearbyPlaces } from './lib/queries'
import { type PlaceFilterValues } from './types/google-places'
import { useRandomizer } from './hooks/use-randomizer'
import { RevealStage } from './components/reveal-stage'

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

  const { current, randomize, poolSize, eligible } = useRandomizer(
    places,
    submitted?.filters.minRating ?? 0
  )

  function handleSubmit(city: string, filters: PlaceFilterValues) {
    setSubmitted({ city, filters })
  }

  return (
    <>
      {!submitted && <StartScreen onSubmit={handleSubmit} />}
      {submitted && (geocoding || searching) && <p>Loading...</p>}
      {submitted && (geoError || placesError) && (
        <p style={{ color: 'red' }}>{(geoError ?? placesError)?.message}</p>
      )}
      {submitted && places && (
        <div>
          <p>{poolSize} place(s) match your filters.</p>
          <button onClick={randomize} disabled={poolSize === 0}>
            🎲 Randomize
          </button>
          <RevealStage
            revealKey={current?.id ?? null}
            candidateLabels={eligible.map((p) => p.name)}
          >
            {current && (
              <div>
                <strong>{current.name}</strong> — {current.address}
                <br />⭐ {current.rating ?? 'no rating'}
              </div>
            )}
          </RevealStage>
        </div>
      )}
    </>
  )
}
