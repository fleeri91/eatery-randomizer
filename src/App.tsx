import { useState } from 'react'
import { StartScreen } from './views/start-screen'
import { useCityLocation, useNearbyPlaces } from './lib/queries'
import { type PlaceFilterValues } from './types/google-places'

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
      {submitted && places && <pre>{JSON.stringify(places, null, 2)}</pre>}
    </>
  )
}
