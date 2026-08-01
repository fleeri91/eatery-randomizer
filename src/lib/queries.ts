import { useQuery } from '@tanstack/react-query'
import { autocompleteCities, getPlaceLocation, searchPlaces } from './api'
import { type Category, type Coordinates } from '@/types/google-places'

// Always fetches at the max radius (searchPlaces' default) and lets callers
// narrow by distance client-side (see filterByDistance) — that way moving
// the radius slider never triggers a refetch.
export function useNearbyPlaces(
  location: Coordinates | undefined,
  category: Category,
  subtypes?: ReadonlySet<string>
) {
  const subtypesKey = subtypes ? [...subtypes].sort() : []
  return useQuery({
    queryKey: ['places', location?.lat, location?.lng, category, subtypesKey],
    queryFn: () => searchPlaces({ location: location!, category, subtypes }),
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
