import {
  type Coordinates,
  type Place,
  type SearchPlacesParams,
  type RawPlace,
  CATEGORY_TYPES,
} from '../types/google-places.ts'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

export async function geocodeCity(cityName: string): Promise<Coordinates> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', cityName)
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`)

  const data = await res.json()
  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error(`No results for "${cityName}" (${data.status})`)
  }

  const { lat, lng } = data.results[0].geometry.location
  return { lat, lng }
}

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
].join(',')

export async function searchPlaces({
  location,
  category,
  radiusMeters = 3000,
}: SearchPlacesParams): Promise<Place[]> {
  const res = await fetch(
    'https://places.googleapis.com/v1/places:searchNearby',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: [CATEGORY_TYPES[category]],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: location.lat, longitude: location.lng },
            radius: radiusMeters,
          },
        },
      }),
    }
  )

  if (!res.ok) {
    throw new Error(`Places search failed: ${res.status} ${await res.text()}`)
  }

  const data: { places?: RawPlace[] } = await res.json()

  return (data.places ?? []).map((p) => ({
    id: p.id,
    name: p.displayName?.text ?? 'Unnamed place',
    address: p.formattedAddress ?? '',
    location: p.location
      ? { lat: p.location.latitude, lng: p.location.longitude }
      : location,
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? null,
    priceLevel: p.priceLevel ?? null,
  }))
}
