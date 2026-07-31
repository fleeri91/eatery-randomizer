import { useQuery } from '@tanstack/react-query'
import { searchPlaces } from './api'
import { type Category, type Coordinates } from '@/types/google-places'

export function useNearbyPlaces(
  location: Coordinates | undefined,
  category: Category,
  radiusMeters?: number,
  subtypes?: ReadonlySet<string>
) {
  const subtypesKey = subtypes ? [...subtypes].sort() : []
  return useQuery({
    queryKey: [
      'places',
      location?.lat,
      location?.lng,
      category,
      radiusMeters,
      subtypesKey,
    ],
    queryFn: () =>
      searchPlaces({ location: location!, category, radiusMeters, subtypes }),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
  })
}
