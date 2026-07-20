export interface Coordinates {
  lat: number
  lng: number
}

export interface Place {
  id: string
  name: string
  address: string
  location: Coordinates
  rating: number | null
  userRatingCount: number | null
  priceLevel: PriceLevel | null
}

export const CATEGORY_TYPES = {
  cafe: 'cafe',
  restaurant: 'restaurant',
  bar: 'bar',
  bakery: 'bakery',
} as const

export type Category = keyof typeof CATEGORY_TYPES

export interface SearchPlacesParams {
  location: Coordinates
  category: Category
  radiusMeters?: number
}

export interface RawPlace {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  location?: { latitude: number; longitude: number }
  rating?: number
  userRatingCount?: number
  priceLevel?: string
}

export interface PlaceFilterValues {
  category: Category
  minRating: number
  radiusMeters: number
  priceLevels: Set<PriceLevel>
}

export interface PlaceSuggestion {
  placeId: string
  mainText: string
  secondaryText: string
}

export const PRICE_LEVELS = [
  'PRICE_LEVEL_INEXPENSIVE',
  'PRICE_LEVEL_MODERATE',
  'PRICE_LEVEL_EXPENSIVE',
  'PRICE_LEVEL_VERY_EXPENSIVE',
] as const

export type PriceLevel = (typeof PRICE_LEVELS)[number]

export const PRICE_LEVEL_LABELS: Record<PriceLevel, string> = {
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

// Stable reference for a "no filter" default — avoids creating a new Set
// every render, which would break the randomizer hook's memoization.
export const EMPTY_PRICE_LEVELS: ReadonlySet<PriceLevel> = new Set()
