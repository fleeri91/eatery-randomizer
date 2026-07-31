import { type Coordinates, type Place } from '@/types/google-places'

export const PRICE_SYMBOLS: Record<string, string> = {
  PRICE_LEVEL_FREE: '',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

export function googleMapsLink(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`
}

/**
 * Google's universal "Maps URLs" directions link — on a phone this hands
 * off to whichever map app the OS/browser resolves it to (Google Maps app
 * on Android, the Google Maps app or web on iOS), preloaded with a route
 * from the picked location to the result.
 */
export function directionsLink(
  place: Pick<Place, 'id' | 'location'>,
  origin: Coordinates | null
): string {
  if (!origin) return googleMapsLink(place.id)

  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('origin', `${origin.lat},${origin.lng}`)
  url.searchParams.set(
    'destination',
    `${place.location.lat},${place.location.lng}`
  )
  url.searchParams.set('destination_place_id', place.id)
  return url.toString()
}

const EARTH_RADIUS_KM = 6371

/** Straight-line (haversine) distance between two coordinates, in km. */
function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** "450 m" under a kilometer, otherwise "1.2 km". Null without an origin. */
export function distanceLabel(
  origin: Coordinates | null,
  point: Coordinates
): string | null {
  if (!origin) return null
  const km = haversineKm(origin, point)
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

/** "$$ · 0.4 km" style subtext for a place, e.g. under a reveal candidate. */
export function placeMeta(place: Place, origin: Coordinates | null): string {
  const price = place.priceLevel ? PRICE_SYMBOLS[place.priceLevel] : null
  return [price, distanceLabel(origin, place.location)]
    .filter(Boolean)
    .join(' · ')
}

export function placeInfoLink(place: Place): string {
  // If you have a Google Place ID, this opens the exact place details page:
  if (place.id) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`
  }

  // Fallback if no place ID is available:
  if (place.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`
  }

  return `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`
}
