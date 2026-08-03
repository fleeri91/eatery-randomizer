import { createPortal } from 'react-dom'
import { ChevronLeft } from 'lucide-react'
import { PlaceMap } from '@/components/place-map'
import {
  directionsLink,
  distanceLabel,
  placeInfoLink,
  PRICE_SYMBOLS,
} from '@/lib/place-links'
import {
  CATEGORY_LABELS,
  type Coordinates,
  type Place,
  type Category,
} from '@/types/google-places'

interface ResultCardProps {
  place: Place
  category: Category
  origin: Coordinates | null
  passedOn: Place[]
  onReroll: () => void
  onBlock: (id: string) => void
  onBack: () => void
}

export function ResultCard({
  place,
  category,
  origin,
  passedOn,
  onReroll,
  onBlock,
  onBack,
}: ResultCardProps) {
  const price = place.priceLevel ? PRICE_SYMBOLS[place.priceLevel] : ''

  // Rendered via a portal (rather than in RevealStage's normal flow) so this
  // full-screen takeover isn't clipped by an ancestor's `reveal-in` transform
  // — a transformed ancestor would otherwise become the containing block for
  // `fixed`, breaking the viewport-relative layout.
  return createPortal(
    <div
      className="fixed inset-0 z-30 flex flex-col bg-background"
      style={{ animation: 'reveal-in 500ms cubic-bezier(0.16, 0.84, 0.28, 1)' }}
    >
      <div className="relative h-[260px] shrink-0 overflow-hidden border-b border-border bg-muted">
        {/* Clickable link wrapping the static map */}
        <a
          href={placeInfoLink(place)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${place.name} in Google Maps`}
          className="block size-full cursor-pointer"
        >
          {/* pointer-events-none lets mouse clicks pass directly to the anchor wrapper */}
          <div className="size-full pointer-events-none">
            <PlaceMap place={place} showLink={false} />
          </div>
        </a>

        {/* Floating back button sitting on top of the link */}
        <button
          type="button"
          aria-label="Back to filters"
          onClick={onBack}
          className="absolute top-4 left-4 z-10 flex size-10 items-center justify-center border border-border bg-card/90 text-foreground transition-transform active:scale-95"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div
          className="flex items-center justify-between gap-3"
          style={{ animation: 'fade-in 300ms ease-out' }}
        >
          <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
            Tonight, it's
          </p>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {CATEGORY_LABELS[category]}
          </p>
        </div>
        <h2
          className="mt-2.5 font-heading text-[38px] leading-[1.0] font-bold tracking-tight text-foreground"
          style={{
            animation:
              'reveal-rise 550ms 60ms cubic-bezier(0.16, 0.84, 0.28, 1) both',
          }}
        >
          {place.name}
        </h2>
        <p className="mt-2.5 text-sm text-muted-foreground">{place.address}</p>

        <div
          className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm tracking-wide text-muted-foreground"
          style={{
            animation:
              'reveal-rise 500ms 180ms cubic-bezier(0.16, 0.84, 0.28, 1) both',
          }}
        >
          <span className="font-bold text-foreground">
            {/* Unrated places are filtered out upstream (filterByRating). */}
            {place.rating!.toFixed(1)}
          </span>
          <span className="text-border">/</span>
          <span>{distanceLabel(origin, place.location) ?? '—'} away</span>
          <span className="text-border">/</span>
          <span>{price || '—'}</span>
        </div>

        {place.userRatingCount !== null && (
          <p className="mt-2.5 text-xs text-muted-foreground">
            {place.userRatingCount} ratings
          </p>
        )}

        {passedOn.length > 0 && (
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground/70">
            <span className="mr-1.5 font-semibold tracking-[0.14em] uppercase">
              Passed on
            </span>
            <span className="line-through">
              {passedOn.map((p) => p.name).join(', ')}
            </span>
          </p>
        )}
      </div>

      <div className="border-t border-border bg-muted/40 px-6 py-4">
        <a
          href={directionsLink(place, origin)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-foreground py-4 text-center font-heading text-base font-bold tracking-[0.06em] text-background uppercase transition-colors hover:bg-foreground/90"
        >
          Go there →
        </a>
        <div className="mt-2.5 flex gap-2.5">
          <button
            type="button"
            onClick={() => onBlock(place.id)}
            className="flex-1 border border-border py-3.5 text-[11px] font-semibold tracking-[0.16em] text-foreground/80 uppercase transition-colors hover:border-primary hover:text-primary"
          >
            Nope
          </button>
          <button
            type="button"
            onClick={onReroll}
            className="flex-1 py-3.5 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Roll again
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
