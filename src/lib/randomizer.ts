import { type Place, type PriceLevel } from '@/types/google-places'

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
