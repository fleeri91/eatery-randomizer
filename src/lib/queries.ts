import { useQuery } from '@tanstack/react-query'
import { autocompleteCities, getPlaceLocation, searchAllNearbyPlaces } from './api'
import { MAX_RADIUS_METERS } from '@/stores/filter-store'
import { type Coordinates } from '@/types/google-places'

// Fetches everything near a location once; category/cuisine/radius/price/
// rating are all filtered client-side from there (see hooks/use-randomizer),
// so the query key only depends on location.
export function useNearbyPlaces(location: Coordinates | undefined) {
  return useQuery({
    queryKey: ['places', location?.lat, location?.lng],
    queryFn: () => searchAllNearbyPlaces(location!, MAX_RADIUS_METERS),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
  })
}

// Keyed on the normalized query text (not the session token) so repeated or
// backtracked keystrokes on the same prefix hit cache instead of the API.
export function useCityAutocomplete(
  query: string,
  getSessionToken: () => string,
  enabled: boolean
) {
  const normalized = query.trim()
  return useQuery({
    queryKey: ['autocomplete', normalized.toLowerCase()],
    queryFn: () => autocompleteCities(normalized, getSessionToken()),
    enabled: enabled && normalized.length >= 2,
    staleTime: 10 * 60 * 1000,
  })
}

// A place's coordinates never change, so once resolved a placeId is cached
// for good — never refetched.
export function placeLocationQueryOptions(placeId: string, sessionToken: string) {
  return {
    queryKey: ['placeLocation', placeId] as const,
    queryFn: () => getPlaceLocation(placeId, sessionToken),
    staleTime: Infinity,
    gcTime: Infinity,
  }
}
