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
  priceLevel: string | null
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
