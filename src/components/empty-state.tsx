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
  allRejected: boolean
  onWidenDistance: () => void
  onDropRating: () => void
  onClearPrice: () => void
  onBackToFilters: () => void
  onStartFresh: () => void
  onForgiveAll: () => void
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
      className="flex w-full items-center justify-between gap-2.5 border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-muted"
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
  allRejected,
  onWidenDistance,
  onDropRating,
  onClearPrice,
  onBackToFilters,
  onStartFresh,
  onForgiveAll,
}: EmptyStateProps) {
  const radiusKm = (radiusMeters / 1000).toFixed(1)
  const maxRadiusKm = (maxRadiusMeters / 1000).toFixed(1)
  const categoryPlural = CATEGORY_LABELS_PLURAL[category]

  // "You've rejected everything left" is a distinct situation from "nothing
  // ever matched your filters" — the fix is forgiving your blocks, not
  // loosening filters, so it gets its own copy and a single-action escape
  // hatch instead of the filter-tweak suggestions below.
  if (allRejected) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:flex-none">
        <div className="relative mb-6 flex size-16 items-center justify-center border border-primary">
          <span className="size-6 rotate-45 border border-primary" />
        </div>

        <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-foreground">
          You've rejected the whole block
        </h2>
        <p className="mt-2.5 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
          Nothing left within {radiusKm} km that clears your filters. Widen
          the net or forgive somebody.
        </p>

        <div className="mt-8 w-full">
          <button
            type="button"
            onClick={onForgiveAll}
            className="w-full bg-primary py-3.5 font-heading text-sm font-bold tracking-wide text-primary-foreground uppercase"
          >
            Start over
          </button>
        </div>
      </div>
    )
  }

  const canWiden = radiusMeters < maxRadiusMeters
  const canDropRating = hasRawResults && !!ratingLabel
  const canClearPrice = hasRawResults && priceActive
  const hasSuggestions = canWiden || canDropRating || canClearPrice

  const reason = hasRawResults
    ? `No ${categoryPlural} within ${radiusKm} km match your filters. Loosen one and chance has more to work with.`
    : `No ${categoryPlural} found within ${radiusKm} km of ${locationLabel || 'this area'}.`

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:flex-none">
      <div className="relative mb-6 flex size-16 items-center justify-center border border-primary">
        <span className="size-6 rotate-45 border border-primary" />
      </div>

      <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-foreground">
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
          className="w-full bg-primary py-3.5 font-heading text-sm font-bold tracking-wide text-primary-foreground uppercase"
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
