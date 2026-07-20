import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Eatery Randomizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <LocationInput value={city} onChange={setCity} />
        <PlaceFilters value={filters} onChange={setFilters} />
        <Button
          className="w-full"
          disabled={!city.trim()}
          onClick={() => onSubmit(city, filters)}
        >
          🎲 Randomize
        </Button>
      </CardContent>
    </Card>
  )
}
