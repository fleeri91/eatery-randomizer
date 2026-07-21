import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { cn } from '@/lib/utils'
import {
  CATEGORY_LABELS,
  CATEGORY_TYPES,
  PRICE_LEVEL_LABELS,
  PRICE_LEVELS,
  type Category,
  type PlaceFilterValues,
  type PriceLevel,
} from '@/types/google-places'

interface PlaceFiltersProps {
  value: PlaceFilterValues
  onChange: (value: PlaceFilterValues) => void
}

const RATING_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Any' },
  { value: 3.5, label: '3.5+' },
  { value: 4, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
]

export function PlaceFilters({ value, onChange }: PlaceFiltersProps) {
  const categories = Object.keys(CATEGORY_TYPES) as Category[]

  function togglePriceLevel(level: PriceLevel) {
    const next = new Set(value.priceLevels)
    next.has(level) ? next.delete(level) : next.add(level)
    onChange({ ...value, priceLevels: next })
  }

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
        <Label className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Minimum rating
        </Label>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((option) => {
            const selected = value.minRating === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...value, minRating: option.value })}
                className={cn(
                  'flex-1 rounded-2xl border py-3 font-heading text-base font-bold transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Price
        </Label>
        <div className="flex gap-2">
          {PRICE_LEVELS.map((level) => {
            const selected = value.priceLevels.has(level)
            return (
              <button
                key={level}
                type="button"
                onClick={() => togglePriceLevel(level)}
                className={cn(
                  'flex-1 rounded-2xl border py-3 font-heading text-base font-bold transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                )}
              >
                {PRICE_LEVEL_LABELS[level]}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {value.priceLevels.size === 0
            ? 'Any price'
            : 'Only selected price ranges'}
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <Label
            htmlFor="radius"
            className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
          >
            Within
          </Label>
          <span className="font-heading text-base font-bold tabular-nums text-primary">
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
