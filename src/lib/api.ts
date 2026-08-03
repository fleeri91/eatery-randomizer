import {
  type Coordinates,
  type Place,
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
  'places.types',
].join(',')

function normalizePriceLevel(raw?: string): PriceLevel | null {
  return (PRICE_LEVELS as readonly string[]).includes(raw ?? '')
    ? (raw as PriceLevel)
    : null
}

function toPlace(p: RawPlace, fallbackLocation: Coordinates): Place {
  return {
    id: p.id,
    name: p.displayName?.text ?? 'Unnamed place',
    address: p.formattedAddress ?? '',
    location: p.location
      ? { lat: p.location.latitude, lng: p.location.longitude }
      : fallbackLocation,
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? null,
    priceLevel: normalizePriceLevel(p.priceLevel),
    types: p.types ?? [],
  }
}

async function searchNearbyByType(
  location: Coordinates,
  radiusMeters: number,
  includedTypes: string[]
): Promise<Place[]> {
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
        includedTypes,
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
  return (data.places ?? []).map((p) => toPlace(p, location))
}

/**
 * Fetches every café/restaurant/bar/bakery Google knows about near a point,
 * once — one Nearby Search per top-level category, since Google caps each
 * call at 20 results with no pagination (a single combined request would
 * only ever return 20 places total across all four categories). Category,
 * cuisine, price, rating, and distance are all filtered client-side from
 * here on (see lib/randomizer.ts), so changing any of those never re-hits
 * the API.
 */
export async function searchAllNearbyPlaces(
  location: Coordinates,
  radiusMeters: number
): Promise<Place[]> {
  const results = await Promise.all(
    Object.values(CATEGORY_TYPES).map((type) =>
      searchNearbyByType(location, radiusMeters, [type])
    )
  )

  const byId = new Map<string, Place>()
  for (const place of results.flat()) byId.set(place.id, place)
  return [...byId.values()]
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

/**
 * Reverse geocodes coordinates into a short human-readable label (e.g.
 * "Chelsea, New York"). Used to show what location the browser actually
 * resolved from "Use my location" — desktop/laptop geolocation is IP/Wi-Fi
 * based (no GPS chip), so a VPN or unusual network can report a location
 * far from where you really are. There's no way to correct that at the API
 * level; showing the real resolved place at least makes a wrong fix
 * obvious instead of hiding behind a generic "Near me" label.
 */
export async function reverseGeocode(
  coords: Coordinates
): Promise<string | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('latlng', `${coords.lat},${coords.lng}`)
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = await res.json()
  const components = data.results?.[0]?.address_components as
    | { long_name: string; types: string[] }[]
    | undefined
  if (!components) return null

  const find = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name

  const neighborhood = find('neighborhood') ?? find('sublocality')
  const locality = find('locality') ?? find('postal_town')
  const region = find('administrative_area_level_1')

  if (neighborhood && locality) return `${neighborhood}, ${locality}`
  if (locality && region) return `${locality}, ${region}`
  return locality ?? data.results?.[0]?.formatted_address ?? null
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
