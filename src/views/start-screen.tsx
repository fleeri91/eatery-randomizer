import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LocationAutocomplete } from '@/components/location-autocomplete'
import { PlaceFilters } from '@/components/place-filter'
import { type Coordinates, type PlaceFilterValues } from '@/types/google-places'

interface StartScreenProps {
  onSubmit: (location: Coordinates, filters: PlaceFilterValues) => void
}

const DEFAULT_FILTERS: PlaceFilterValues = {
  category: 'cafe',
  minRating: 0,
  radiusMeters: 3000,
  priceLevels: new Set(),
}

export function StartScreen({ onSubmit }: StartScreenProps) {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [filters, setFilters] = useState<PlaceFilterValues>(DEFAULT_FILTERS)

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Eatery Randomizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <LocationAutocomplete onSelect={(loc) => setLocation(loc)} />
        <PlaceFilters value={filters} onChange={setFilters} />
        <Button
          className="w-full"
          disabled={!location}
          onClick={() => location && onSubmit(location, filters)}
        >
          🎲 Randomize
        </Button>
      </CardContent>
    </Card>
  )
}
