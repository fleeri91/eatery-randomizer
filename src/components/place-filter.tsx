import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { cn } from '@/lib/utils'
import {
  CATEGORY_TYPES,
  type Category,
  type PlaceFilterValues,
} from '@/types/google-places'

interface PlaceFiltersProps {
  value: PlaceFilterValues
  onChange: (value: PlaceFilterValues) => void
}

const CATEGORY_LABELS: Record<Category, string> = {
  cafe: '☕ Café',
  restaurant: '🍽️ Restaurant',
  bar: '🍺 Bar',
  bakery: '🥐 Bakery',
}

export function PlaceFilters({ value, onChange }: PlaceFiltersProps) {
  const categories = Object.keys(CATEGORY_TYPES) as Category[]

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Category
        </Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = value.category === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ ...value, category: c })}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                )}
              >
                {CATEGORY_LABELS[c]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <Label
            htmlFor="minRating"
            className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
          >
            Minimum rating
          </Label>
          <span className="font-heading text-base font-bold text-primary">
            {value.minRating === 0 ? 'Any' : `${value.minRating.toFixed(1)}+`}
          </span>
        </div>
        <Slider
          id="minRating"
          min={0}
          max={5}
          step={0.5}
          value={[value.minRating]}
          onValueChange={(val) => {
            const minRating = Array.isArray(val) ? val[0] : val
            onChange({ ...value, minRating })
          }}
        />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <Label
            htmlFor="radius"
            className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
          >
            Within
          </Label>
          <span className="font-heading text-base font-bold text-primary">
            {(value.radiusMeters / 1000).toFixed(1)} km
          </span>
        </div>
        <Slider
          id="radius"
          min={0}
          max={3000}
          step={100}
          value={[value.radiusMeters]}
          onValueChange={(val) => {
            const radiusMeters = Array.isArray(val) ? val[0] : val
            onChange({ ...value, radiusMeters })
          }}
        />
      </div>
    </div>
  )
}
