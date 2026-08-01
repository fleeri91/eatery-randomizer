import { Badge } from '@/components/ui/badge'
import { directionsLink, distanceLabel, PRICE_SYMBOLS } from '@/lib/place-links'
import {
  CATEGORY_LABELS,
  type Coordinates,
  type Place,
  type Category,
} from '@/types/google-places'

interface DesktopResultCardProps {
  place: Place
  category: Category
  origin: Coordinates | null
  passedOn: Place[]
  onReroll: () => void
  onBlock: (id: string) => void
}

export function DesktopResultCard({
  place,
  category,
  origin,
  passedOn,
  onReroll,
  onBlock,
}: DesktopResultCardProps) {
  const price = place.priceLevel ? PRICE_SYMBOLS[place.priceLevel] : ''

  return (
    <div
      className="w-full border border-border bg-card"
      style={{ animation: 'reveal-in 500ms cubic-bezier(0.16, 0.84, 0.28, 1)' }}
    >
      <div className="flex items-center justify-between border-b border-border px-7 py-3">
        <p
          className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase"
          style={{ animation: 'fade-in 300ms ease-out' }}
        >
          Tonight, it's
        </p>
        <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {CATEGORY_LABELS[category]}
        </p>
      </div>
      <div className="px-8 pt-8 pb-8">
        <h2
          className="font-heading text-[52px] leading-none font-bold tracking-tight text-foreground"
          style={{
            animation:
              'reveal-rise 600ms 60ms cubic-bezier(0.16, 0.84, 0.28, 1) both',
          }}
        >
          {place.name}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">{place.address}</p>

        {place.rating === null && (
          <Badge variant="secondary" className="mt-3 h-auto px-3 py-1.5 text-xs font-medium">
            Not yet rated — you're the scout
          </Badge>
        )}

        <div
          className="mt-7 flex border-t border-b border-border"
          style={{
            animation:
              'reveal-rise 500ms 180ms cubic-bezier(0.16, 0.84, 0.28, 1) both',
          }}
        >
          <div className="flex-1 border-r border-border py-4">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Rating
            </div>
            <div className="mt-2 font-heading text-[28px] leading-none font-bold text-foreground">
              {place.rating !== null ? place.rating.toFixed(1) : '—'}
            </div>
          </div>
          <div className="flex-1 border-r border-border py-4 pl-6">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Away
            </div>
            <div className="mt-2 font-heading text-[28px] leading-none font-bold text-foreground">
              {distanceLabel(origin, place.location) ?? '—'}
            </div>
          </div>
          <div className="flex-1 py-4 pl-6">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Price
            </div>
            <div className="mt-2 font-heading text-[28px] leading-none font-bold text-foreground">
              {price || '—'}
            </div>
          </div>
        </div>

        {passedOn.length > 0 && (
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground/70">
            <span className="mr-1.5 font-semibold tracking-[0.14em] uppercase">
              Passed on
            </span>
            <span className="line-through">
              {passedOn.map((p) => p.name).join(', ')}
            </span>
          </p>
        )}

        <div className="mt-7 flex items-center gap-3">
          <a
            href={directionsLink(place, origin)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-primary py-4 text-center font-heading text-sm font-bold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            Go there →
          </a>
          <button
            type="button"
            onClick={() => onBlock(place.id)}
            className="border border-border px-6 py-4 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary"
          >
            Nope, again
          </button>
        </div>
        <button
          type="button"
          onClick={onReroll}
          className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          Roll again
        </button>
      </div>
    </div>
  )
}
