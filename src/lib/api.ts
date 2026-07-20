import {
  type Coordinates,
  type Place,
  type SearchPlacesParams,
  type RawPlace,
  CATEGORY_TYPES,
  type PlaceSuggestion,
  type PriceLevel,
  PRICE_LEVELS,
} from '@/types/google-places.ts'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
].join(',')

function normalizePriceLevel(raw?: string): PriceLevel | null {
  return (PRICE_LEVELS as readonly string[]).includes(raw ?? '')
    ? (raw as PriceLevel)
    : null
}

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
    priceLevel: normalizePriceLevel(p.priceLevel),
  }))
}

export async function autocompleteCities(
  input: string,
  sessionToken: string
): Promise<PlaceSuggestion[]> {
  const res = await fetch(
    'https://places.googleapis.com/v1/places:autocomplete',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: ['(cities)'],
        sessionToken,
      }),
    }
  )

  if (!res.ok) throw new Error(`Autocomplete failed: ${res.status}`)

  const data = await res.json()
  return (data.suggestions ?? [])
    .filter((s: { placePrediction?: unknown }) => s.placePrediction)
    .map((s: any) => ({
      placeId: s.placePrediction.placeId,
      mainText:
        s.placePrediction.structuredFormat?.mainText?.text ??
        s.placePrediction.text.text,
      secondaryText:
        s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
    }))
}

export async function getPlaceLocation(
  placeId: string,
  sessionToken: string
): Promise<Coordinates> {
  const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`)
  url.searchParams.set('sessionToken', sessionToken)

  const res = await fetch(url.toString(), {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'location',
    },
  })

  if (!res.ok) throw new Error(`Place details failed: ${res.status}`)

  const data = await res.json()
  return { lat: data.location.latitude, lng: data.location.longitude }
}
