import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { directionsLink, PRICE_SYMBOLS } from '@/lib/place-links'
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
  onReroll: () => void
  onBlock: (id: string) => void
}

export function DesktopResultCard({
  place,
  category,
  origin,
  onReroll,
  onBlock,
}: DesktopResultCardProps) {
  const price = place.priceLevel ? PRICE_SYMBOLS[place.priceLevel] : ''

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_30px_60px_-24px_oklch(0.4_0.06_40/0.3)]">
      <div className="h-1.5 bg-primary" />
      <div className="px-8 pt-7 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground/80 uppercase">
              Chance picked
            </p>
            <h2 className="mt-2 font-heading text-[42px] leading-[1.0] font-extrabold tracking-tight text-foreground">
              {place.name}
            </h2>
          </div>
          {place.rating !== null && (
            <div className="flex-shrink-0 rounded-2xl bg-secondary px-4 py-2.5 text-center">
              <div className="font-heading text-[26px] leading-none font-extrabold text-primary">
                {place.rating.toFixed(1)}
              </div>
              <div className="mt-1 text-[9px] font-semibold tracking-[0.14em] text-muted-foreground">
                RATING
              </div>
            </div>
          )}
        </div>

        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-3 shrink-0 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-primary" />
          {place.address}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground/80">
            {CATEGORY_LABELS[category]}
          </span>
          {price && (
            <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground/80">
              {price}
            </span>
          )}
        </div>

        {place.rating === null && (
          <Badge
            variant="secondary"
            className="mt-3 h-auto rounded-full px-3 py-1.5 text-xs font-medium"
          >
            Not yet rated — you're the scout
          </Badge>
        )}

        <a
          href={directionsLink(place, origin)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block w-full rounded-2xl bg-foreground py-3.5 text-center text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          Get directions
        </a>

        <div className="mt-2.5 flex gap-2.5">
          <Button
            className="flex-1 rounded-2xl py-5 text-sm font-bold"
            onClick={onReroll}
          >
            ↻ Roll again
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-2xl py-5 text-sm font-bold"
            onClick={() => onBlock(place.id)}
          >
            Not this one
          </Button>
        </div>
      </div>
    </div>
  )
}
