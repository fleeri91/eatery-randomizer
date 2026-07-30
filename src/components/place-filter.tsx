import { Label } from './ui/label'
import { cn } from '@/lib/utils'
import { useFilterStore } from '@/stores/filter-store'
import {
  CATEGORY_LABELS,
  CATEGORY_TYPES,
  PRICE_LEVEL_LABELS,
  PRICE_LEVELS,
  type Category,
} from '@/types/google-places'

interface PlaceFiltersProps {
  disabled?: boolean
}

const RATING_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Any' },
  { value: 3.5, label: '3.5+' },
  { value: 4, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
]

const DISTANCE_OPTIONS: { meters: number; label: string }[] = [
  { meters: 500, label: '0.5 km' },
  { meters: 1000, label: '1 km' },
  { meters: 2000, label: '2 km' },
  { meters: 3000, label: '3 km' },
]

const chipClass = (selected: boolean, disabled: boolean) =>
  cn(
    'border px-3.5 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors disabled:pointer-events-none',
    disabled && 'opacity-50',
    selected
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-border bg-card text-foreground/80 hover:bg-muted'
  )

export function PlaceFilters({ disabled = false }: PlaceFiltersProps) {
  const categories = Object.keys(CATEGORY_TYPES) as Category[]
  const value = useFilterStore((s) => s.filters)
  const setCategory = useFilterStore((s) => s.setCategory)
  const setMinRating = useFilterStore((s) => s.setMinRating)
  const setRadiusMeters = useFilterStore((s) => s.setRadiusMeters)
  const togglePriceLevel = useFilterStore((s) => s.togglePriceLevel)

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label className="text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Category
        </Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = value.category === c
            return (
              <button
                key={c}
                type="button"
                disabled={disabled}
                onClick={() => setCategory(c)}
                className={chipClass(selected, disabled)}
              >
                {CATEGORY_LABELS[c]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Price
        </Label>
        <div className="flex gap-2">
          {PRICE_LEVELS.map((level) => {
            const selected = value.priceLevels.has(level)
            return (
              <button
                key={level}
                type="button"
                disabled={disabled}
                onClick={() => togglePriceLevel(level)}
                className={cn('flex-1', chipClass(selected, disabled))}
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
        <Label className="text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Rating
        </Label>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((option) => {
            const selected = value.minRating === option.value
            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() => setMinRating(option.value)}
                className={cn('flex-1', chipClass(selected, disabled))}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Within
        </Label>
        <div className="flex gap-2">
          {DISTANCE_OPTIONS.map((option) => {
            const selected = value.radiusMeters === option.meters
            return (
              <button
                key={option.meters}
                type="button"
                disabled={disabled}
                onClick={() => setRadiusMeters(option.meters)}
                className={cn('flex-1', chipClass(selected, disabled))}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
