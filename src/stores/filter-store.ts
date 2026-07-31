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
    subtypes: new Set(),
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
  toggleSubtype: (type: string) => void
  clearSubtypes: () => void
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

  // Switching category invalidates whatever subtypes were picked for the
  // previous one (they belong to a different Places type taxonomy).
  setCategory: (category) =>
    set((state) => ({
      filters: { ...state.filters, category, subtypes: new Set() },
    })),

  toggleSubtype: (type) =>
    set((state) => {
      const subtypes = new Set(state.filters.subtypes)
      if (subtypes.has(type)) subtypes.delete(type)
      else subtypes.add(type)
      return { filters: { ...state.filters, subtypes } }
    }),

  clearSubtypes: () =>
    set((state) => ({ filters: { ...state.filters, subtypes: new Set() } })),

  setMinRating: (minRating) =>
    set((state) => ({ filters: { ...state.filters, minRating } })),

  setRadiusMeters: (radiusMeters) =>
    set((state) => ({ filters: { ...state.filters, radiusMeters } })),

  togglePriceLevel: (level) =>
    set((state) => {
      const priceLevels = new Set(state.filters.priceLevels)
      if (priceLevels.has(level)) priceLevels.delete(level)
      else priceLevels.add(level)
      return { filters: { ...state.filters, priceLevels } }
    }),

  clearPriceLevels: () =>
    set((state) => ({
      filters: { ...state.filters, priceLevels: new Set() },
    })),

  reset: () =>
    set({ location: null, locationLabel: '', filters: createDefaultFilters() }),
}))
