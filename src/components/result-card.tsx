import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  cafe: '☕ Café',
  restaurant: '🍽️ Restaurant',
  bar: '🍺 Bar',
  bakery: '🥐 Bakery',
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
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">
      <iframe
        title={`Map showing ${place.name}`}
        width="100%"
        height="160"
        style={{ border: 0 }}
        loading="lazy"
        src={mapEmbedSrc(place.id)}
      />

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{place.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {CATEGORY_LABELS[category]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{place.address}</p>
      </CardHeader>

      <CardContent className="flex items-center gap-2 text-sm">
        {place.rating !== null ? (
          <span>
            ⭐ {place.rating.toFixed(1)}
            {place.userRatingCount !== null && (
              <span className="text-muted-foreground">
                {' '}
                ({place.userRatingCount})
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">No rating yet</span>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <a
          href={googleMapsLink(place.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline underline-offset-2 self-start"
        >
          Open in Google Maps →
        </a>

        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onBlock(place.id)}
          >
            🚫 Block
          </Button>
          <Button className="flex-1" onClick={onReroll}>
            🎲 Reroll
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
