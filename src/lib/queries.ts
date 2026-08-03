import { useQuery } from '@tanstack/react-query'
import { searchAllNearbyPlaces } from './api'
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
