import { useQuery } from '@tanstack/react-query'
import { geocodeCity, searchPlaces } from './api'
import { type Category, type Coordinates } from '@/types/google-places'

export function useCityLocation(cityName: string) {
  return useQuery({
    queryKey: ['geocode', cityName],
    queryFn: () => geocodeCity(cityName),
    enabled: cityName.trim().length > 0,
    staleTime: Infinity,
  })
}

export function useNearbyPlaces(
  location: Coordinates | undefined,
  category: Category,
  radiusMeters?: number
) {
  return useQuery({
    queryKey: ['places', location?.lat, location?.lng, category, radiusMeters],
    queryFn: () =>
      searchPlaces({ location: location!, category, radiusMeters }),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
  })
}
