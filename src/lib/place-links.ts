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
