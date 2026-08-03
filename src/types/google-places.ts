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
  /** Raw Google Places type strings (e.g. "restaurant", "italian_restaurant") — used to filter by category/cuisine client-side. */
  types: string[]
}

export const CATEGORY_TYPES = {
  cafe: 'cafe',
  restaurant: 'restaurant',
  bar: 'bar',
  bakery: 'bakery',
} as const

export type Category = keyof typeof CATEGORY_TYPES

export const CATEGORY_LABELS: Record<Category, string> = {
  cafe: 'Café',
  restaurant: 'Restaurant',
  bar: 'Bar',
  bakery: 'Bakery',
}

// Real Google Places API (New) type enums, one specific subtype per chip.
// Passing any of these as `includedTypes` narrows Nearby Search further than
// the coarse category alone (a place typed "italian_restaurant" is already
// a restaurant, so there's no need to send both).
export const CATEGORY_SUBTYPES: Record<Category, readonly string[]> = {
  restaurant: [
    'afghani_restaurant', 'african_restaurant', 'american_restaurant', 'argentinian_restaurant', 'asian_fusion_restaurant', 'asian_restaurant', 'australian_restaurant', 'austrian_restaurant', 'bangladeshi_restaurant', 'barbecue_restaurant', 'basque_restaurant', 'bavarian_restaurant', 'belgian_restaurant', 'bistro', 'brazilian_restaurant', 'breakfast_restaurant', 'british_restaurant', 'brunch_restaurant', 'buffet_restaurant', 'burmese_restaurant', 'burrito_restaurant', 'cajun_restaurant', 'californian_restaurant', 'cambodian_restaurant', 'cantonese_restaurant', 'caribbean_restaurant', 'chicken_restaurant', 'chicken_wings_restaurant', 'chilean_restaurant', 'chinese_noodle_restaurant', 'chinese_restaurant', 'colombian_restaurant', 'croatian_restaurant', 'cuban_restaurant', 'czech_restaurant', 'danish_restaurant', 'deli', 'dessert_restaurant', 'dim_sum_restaurant', 'diner', 'dumpling_restaurant', 'dutch_restaurant', 'eastern_european_restaurant', 'ethiopian_restaurant', 'european_restaurant', 'falafel_restaurant', 'family_restaurant', 'fast_food_restaurant', 'filipino_restaurant', 'fine_dining_restaurant', 'fish_and_chips_restaurant', 'fondue_restaurant', 'french_restaurant', 'fusion_restaurant', 'german_restaurant', 'greek_restaurant', 'gyro_restaurant', 'halal_restaurant', 'hamburger_restaurant', 'hawaiian_restaurant', 'hot_dog_restaurant', 'hot_pot_restaurant', 'hungarian_restaurant', 'indian_restaurant', 'indonesian_restaurant', 'irish_restaurant', 'israeli_restaurant', 'italian_restaurant', 'japanese_curry_restaurant', 'japanese_izakaya_restaurant', 'japanese_restaurant', 'kebab_shop', 'korean_barbecue_restaurant', 'korean_restaurant', 'latin_american_restaurant', 'lebanese_restaurant', 'malaysian_restaurant', 'mediterranean_restaurant', 'mexican_restaurant', 'middle_eastern_restaurant', 'mongolian_barbecue_restaurant', 'moroccan_restaurant', 'noodle_shop', 'north_indian_restaurant', 'oyster_bar_restaurant', 'pakistani_restaurant', 'persian_restaurant', 'peruvian_restaurant', 'pizza_restaurant', 'polish_restaurant', 'portuguese_restaurant', 'ramen_restaurant', 'romanian_restaurant', 'russian_restaurant', 'sandwich_shop', 'scandinavian_restaurant', 'seafood_restaurant', 'shawarma_restaurant', 'soul_food_restaurant', 'soup_restaurant', 'south_american_restaurant', 'south_indian_restaurant', 'southwestern_us_restaurant', 'spanish_restaurant', 'sri_lankan_restaurant', 'steak_house', 'sushi_restaurant', 'swiss_restaurant', 'taco_restaurant', 'taiwanese_restaurant', 'tapas_restaurant', 'tex_mex_restaurant', 'thai_restaurant', 'tibetan_restaurant', 'tonkatsu_restaurant', 'turkish_restaurant', 'ukrainian_restaurant', 'vegan_restaurant', 'vegetarian_restaurant', 'vietnamese_restaurant', 'western_restaurant', 'yakiniku_restaurant', 'yakitori_restaurant',
  ],
  cafe: [
    'acai_shop', 'cat_cafe', 'coffee_roastery', 'coffee_shop', 'coffee_stand', 'dog_cafe', 'juice_shop', 'tea_house',
  ],
  bar: [
    'bar_and_grill', 'beer_garden', 'brewery', 'brewpub', 'cocktail_bar', 'gastropub', 'hookah_bar', 'irish_pub', 'lounge_bar', 'pub', 'sports_bar', 'wine_bar', 'winery',
  ],
  bakery: [
    'bagel_shop', 'cake_shop', 'candy_store', 'chocolate_factory', 'chocolate_shop', 'confectionery', 'dessert_shop', 'donut_shop', 'ice_cream_shop', 'pastry_shop',
  ],
}

export function subtypeLabel(type: string): string {
  return type.replace(/_restaurant$/, '').replace(/_/g, ' ')
}

export interface RawPlace {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  location?: { latitude: number; longitude: number }
  rating?: number
  userRatingCount?: number
  priceLevel?: string
  types?: string[]
}

export interface PlaceFilterValues {
  category: Category
  subtypes: Set<string>
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
