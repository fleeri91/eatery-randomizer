import { haversineKm } from '@/lib/place-links'
import {
  CATEGORY_TYPES,
  type Category,
  type Coordinates,
  type Place,
  type PriceLevel,
} from '@/types/google-places'

export function filterByCategory(places: Place[], category: Category): Place[] {
  return places.filter((p) => p.types.includes(CATEGORY_TYPES[category]))
}

export function filterBySubtypes(
  places: Place[],
  subtypes: ReadonlySet<string>
): Place[] {
  if (subtypes.size === 0) return places
  return places.filter((p) => p.types.some((t) => subtypes.has(t)))
}

export function filterByDistance(
  places: Place[],
  origin: Coordinates | null,
  radiusMeters: number
): Place[] {
  if (!origin) return places
  return places.filter(
    (p) => haversineKm(origin, p.location) * 1000 <= radiusMeters
  )
}

export function filterByRating(places: Place[], minRating: number): Place[] {
  if (minRating <= 0) return places
  return places.filter((p) => p.rating !== null && p.rating >= minRating)
}

export function filterByPrice(
  places: Place[],
  priceLevels: ReadonlySet<PriceLevel>
): Place[] {
  if (priceLevels.size === 0) return places
  return places.filter(
    (p) => p.priceLevel !== null && priceLevels.has(p.priceLevel)
  )
}

export function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}
