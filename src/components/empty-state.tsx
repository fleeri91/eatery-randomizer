import { ChevronRight, Maximize2, Star, Tag } from 'lucide-react'
import type { Category } from '@/types/google-places'

interface EmptyStateProps {
  category: Category
  locationLabel: string
  radiusMeters: number
  maxRadiusMeters: number
  hasRawResults: boolean
  ratingLabel: string | null
  priceActive: boolean
  onWidenDistance: () => void
  onDropRating: () => void
  onClearPrice: () => void
  onBackToFilters: () => void
  onStartFresh: () => void
}

const CATEGORY_LABELS_PLURAL: Record<Category, string> = {
  cafe: 'cafés',
  restaurant: 'restaurants',
  bar: 'bars',
  bakery: 'bakeries',
}

function SuggestionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2.5 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-muted"
    >
      <span className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
        {icon}
        {label}
      </span>
      <ChevronRight className="size-4 shrink-0 text-primary" />
    </button>
  )
}

export function EmptyState({
  category,
  locationLabel,
  radiusMeters,
  maxRadiusMeters,
  hasRawResults,
  ratingLabel,
  priceActive,
  onWidenDistance,
  onDropRating,
  onClearPrice,
  onBackToFilters,
  onStartFresh,
}: EmptyStateProps) {
  const radiusKm = (radiusMeters / 1000).toFixed(1)
  const maxRadiusKm = (maxRadiusMeters / 1000).toFixed(1)
  const categoryPlural = CATEGORY_LABELS_PLURAL[category]
  const canWiden = radiusMeters < maxRadiusMeters
  const canDropRating = hasRawResults && !!ratingLabel
  const canClearPrice = hasRawResults && priceActive
  const hasSuggestions = canWiden || canDropRating || canClearPrice

  const reason = hasRawResults
    ? `No ${categoryPlural} within ${radiusKm} km match your filters. Loosen one and chance has more to work with.`
    : `No ${categoryPlural} found within ${radiusKm} km of ${locationLabel || 'this area'}.`

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center px-4 py-10 text-center">
      <div className="relative mb-6 size-24">
        <div className="absolute inset-0 rounded-full bg-secondary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="size-7 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-primary/40" />
        </div>
        <div className="absolute inset-0 rounded-full border-[3px] border-primary" />
        <div className="absolute top-1/2 left-1/2 h-[3px] w-[124px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-primary" />
      </div>

      <h2 className="font-heading text-2xl leading-tight font-extrabold tracking-tight text-foreground">
        Nothing fits — yet
      </h2>
      <p className="mt-2.5 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
        {reason}
      </p>

      {hasSuggestions && (
        <div className="mt-6 flex w-full flex-col gap-2.5">
          {canWiden && (
            <SuggestionButton
              icon={<Maximize2 className="size-4 text-primary" />}
              label={`Widen distance to ${maxRadiusKm} km`}
              onClick={onWidenDistance}
            />
          )}
          {canDropRating && (
            <SuggestionButton
              icon={<Star className="size-4 text-primary" />}
              label={`Drop the ${ratingLabel} rating filter`}
              onClick={onDropRating}
            />
          )}
          {canClearPrice && (
            <SuggestionButton
              icon={<Tag className="size-4 text-primary" />}
              label="Clear the price filter"
              onClick={onClearPrice}
            />
          )}
        </div>
      )}

      <div className="mt-8 w-full">
        <button
          type="button"
          onClick={onBackToFilters}
          className="w-full rounded-2xl bg-primary py-3.5 font-heading text-base font-bold text-primary-foreground shadow-[0_10px_24px_-6px_oklch(0.66_0.19_32/0.5)]"
        >
          Back to filters
        </button>
        <button
          type="button"
          onClick={onStartFresh}
          className="mt-2.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Or clear everything and start fresh
        </button>
      </div>
    </div>
  )
}
