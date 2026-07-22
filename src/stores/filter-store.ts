import { create } from 'zustand'
import {
  type Category,
  type Coordinates,
  type PlaceFilterValues,
  type PriceLevel,
} from '@/types/google-places'

export const MAX_RADIUS_METERS = 3000

function createDefaultFilters(): PlaceFilterValues {
  return {
    category: 'cafe',
    minRating: 0,
    radiusMeters: MAX_RADIUS_METERS,
    priceLevels: new Set(),
  }
}

interface FilterStore {
  location: Coordinates | null
  locationLabel: string
  filters: PlaceFilterValues
  setLocation: (location: Coordinates, label: string) => void
  setCategory: (category: Category) => void
  setMinRating: (minRating: number) => void
  setRadiusMeters: (radiusMeters: number) => void
  togglePriceLevel: (level: PriceLevel) => void
  clearPriceLevels: () => void
  reset: () => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  location: null,
  locationLabel: '',
  filters: createDefaultFilters(),

  setLocation: (location, label) => set({ location, locationLabel: label }),

  setCategory: (category) =>
    set((state) => ({ filters: { ...state.filters, category } })),

  setMinRating: (minRating) =>
    set((state) => ({ filters: { ...state.filters, minRating } })),

  setRadiusMeters: (radiusMeters) =>
    set((state) => ({ filters: { ...state.filters, radiusMeters } })),

  togglePriceLevel: (level) =>
    set((state) => {
      const priceLevels = new Set(state.filters.priceLevels)
      priceLevels.has(level)
        ? priceLevels.delete(level)
        : priceLevels.add(level)
      return { filters: { ...state.filters, priceLevels } }
    }),

  clearPriceLevels: () =>
    set((state) => ({
      filters: { ...state.filters, priceLevels: new Set() },
    })),

  reset: () =>
    set({ location: null, locationLabel: '', filters: createDefaultFilters() }),
}))
