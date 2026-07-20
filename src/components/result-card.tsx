import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Place, type Category } from '@/types/google-places'

interface ResultCardProps {
  place: Place
  category: Category
  onReroll: () => void
  onBlock: (id: string) => void
}

const CATEGORY_LABELS: Record<Category, string> = {
  cafe: 'Café',
  restaurant: 'Restaurant',
  bar: 'Bar',
  bakery: 'Bakery',
}

const PRICE_SYMBOLS: Record<string, string> = {
  PRICE_LEVEL_FREE: '',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

const EMBED_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

function mapEmbedSrc(placeId: string): string {
  const url = new URL('https://www.google.com/maps/embed/v1/place')
  url.searchParams.set('key', EMBED_API_KEY)
  url.searchParams.set('q', `place_id:${placeId}`)
  return url.toString()
}

function googleMapsLink(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`
}

export function ResultCard({
  place,
  category,
  onReroll,
  onBlock,
}: ResultCardProps) {
  const price = place.priceLevel ? PRICE_SYMBOLS[place.priceLevel] : ''

  return (
    <Card className="w-full max-w-sm mx-auto gap-0 rounded-3xl border-border/70 py-0 shadow-[0_-14px_36px_-18px_oklch(0.5_0.1_40/0.25)]">
      <CardContent className="px-6 pt-6 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-3xl leading-[1.05] font-extrabold tracking-tight text-foreground">
              {place.name}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {CATEGORY_LABELS[category]}
              {price && ` · ${price}`} · {place.address}
            </p>
          </div>
          {place.rating !== null ? (
            <div className="flex-shrink-0 text-center">
              <div className="font-heading text-2xl font-extrabold text-primary">
                {place.rating.toFixed(1)}
              </div>
              <div className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80">
                RATING
              </div>
            </div>
          ) : null}
        </div>

        {place.rating === null && (
          <Badge
            variant="secondary"
            className="mt-3 h-auto rounded-full px-3 py-1.5 text-xs font-medium"
          >
            Not yet rated — you're the scout
          </Badge>
        )}

        {place.userRatingCount !== null && place.rating !== null && (
          <p className="mt-2 text-xs text-muted-foreground">
            {place.userRatingCount} ratings
          </p>
        )}

        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
          <iframe
            title={`Map showing ${place.name}`}
            width="100%"
            height="120"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            src={mapEmbedSrc(place.id)}
          />
        </div>

        <a
          href={googleMapsLink(place.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full rounded-2xl bg-foreground py-3.5 text-center text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          Get directions
        </a>

        <div className="mt-2.5 flex gap-2.5 pb-6">
          <Button className="flex-1 rounded-2xl py-5 text-sm font-bold" onClick={onReroll}>
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
      </CardContent>
    </Card>
  )
}
