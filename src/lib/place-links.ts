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
