import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LocationInput } from '@/components/location-input'
import { PlaceFilters } from '@/components/place-filter'
import { type PlaceFilterValues } from '@/types/google-places'

interface StartScreenProps {
  onSubmit: (city: string, filters: PlaceFilterValues) => void
}

const DEFAULT_FILTERS: PlaceFilterValues = {
  category: 'cafe',
  minRating: 0,
  radiusMeters: 3000,
}

export function StartScreen({ onSubmit }: StartScreenProps) {
  const [city, setCity] = useState('')
  const [filters, setFilters] = useState<PlaceFilterValues>(DEFAULT_FILTERS)

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_60px_-20px_oklch(0.4_0.06_40/0.2)]">
      <div className="px-6 pt-7 pb-2">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
          Eatery Randomizer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Can't decide? Set the terms — chance does the rest.
        </p>
      </div>

      <div className="space-y-6 px-6 py-5">
        <LocationInput value={city} onChange={setCity} />
        <PlaceFilters value={filters} onChange={setFilters} />
      </div>

      <div className="border-t border-border bg-muted/40 px-6 py-5">
        <Button
          className="w-full rounded-2xl py-6 font-heading text-lg font-bold shadow-[0_10px_24px_-6px_oklch(0.66_0.19_32/0.5)]"
          disabled={!city.trim()}
          onClick={() => onSubmit(city, filters)}
        >
          🎲 Randomize
        </Button>
        <p className="mt-2.5 text-center text-xs text-muted-foreground">
          Whim picks one at random from what fits.
        </p>
      </div>
    </div>
  )
}
