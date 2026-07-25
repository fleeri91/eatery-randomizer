import { createPortal } from 'react-dom'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { directionsLink, placeInfoLink, PRICE_SYMBOLS } from '@/lib/place-links'
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
  onReroll: () => void
  onBlock: (id: string) => void
  onBack: () => void
}

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

// Hides all default labels (streets, POIs, transit) so the hero reads as a
// clean, minimal map instead of a busy embed — just roads/terrain and our
// own marker.
const CLEAN_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
]

const staticMapOptions: google.maps.MapOptions = {
  // Disable map manipulations
  gestureHandling: 'none', // Disables pan, zoom, pinch, and scroll
  zoomControl: false, // Removes zoom +/- buttons
  mapTypeControl: false, // Removes Map/Satellite toggle
  scaleControl: false, // Removes scale bar
  streetViewControl: false, // Removes Pegman street view icon
  rotateControl: false, // Removes rotation control
  fullscreenControl: false, // Removes fullscreen button
  keyboardShortcuts: false, // Disables keyboard arrows/navigation
  clickableIcons: false, // Prevents clicking POIs (restaurants, parks, etc.)
  disableDefaultUI: true, // Safety catch to turn off all standard UI controls
  styles: CLEAN_MAP_STYLES,
}

function PlaceMap({ place }: { place: Place }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MAPS_API_KEY,
  })

  if (!isLoaded) return null

  return (
    <GoogleMap
      mapContainerClassName="size-full"
      center={place.location}
      zoom={15}
      options={staticMapOptions}
    >
      <Marker position={place.location} />
    </GoogleMap>
  )
}

export function ResultCard({
  place,
  category,
  origin,
  onReroll,
  onBlock,
  onBack,
}: ResultCardProps) {
  const price = place.priceLevel ? PRICE_SYMBOLS[place.priceLevel] : ''

  // Rendered via a portal (rather than in RevealStage's normal flow) so this
  // full-screen takeover isn't clipped by an ancestor's `sheet-up` transform
  // — a transformed ancestor would otherwise become the containing block for
  // `fixed`, breaking the viewport-relative layout.
  return createPortal(
    <div
      className="fixed inset-0 z-30 flex flex-col bg-background"
      style={{ animation: 'sheet-up 500ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
    >
      <div className="relative h-[300px] shrink-0 overflow-hidden bg-muted">
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
            <PlaceMap place={place} />
          </div>
        </a>

        {/* Floating back button sitting on top of the link */}
        <button
          type="button"
          aria-label="Back to filters"
          onClick={onBack}
          className="absolute top-4 left-4 z-10 flex size-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-[0_4px_12px_oklch(0.4_0.06_40/0.25)] transition-transform active:scale-95"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex items-start justify-between gap-3.5">
          <div className="min-w-0">
            <h2 className="font-heading text-[34px] leading-[1.0] font-extrabold tracking-tight text-foreground">
              {place.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {place.address}
            </p>
          </div>
          {place.rating !== null && (
            <div className="flex-shrink-0 rounded-2xl bg-secondary px-3.5 py-2.5 text-center">
              <div className="font-heading text-[26px] leading-none font-extrabold text-primary">
                {place.rating.toFixed(1)}
              </div>
              <div className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">
                RATING
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-muted px-3.5 py-1.5 text-[13px] font-medium text-foreground/80">
            {CATEGORY_LABELS[category]}
          </span>
          {price && (
            <span className="rounded-full border border-border bg-muted px-3.5 py-1.5 text-[13px] font-medium text-foreground/80">
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

        {place.userRatingCount !== null && place.rating !== null && (
          <p className="mt-2 text-xs text-muted-foreground">
            {place.userRatingCount} ratings
          </p>
        )}
      </div>

      <div className="border-t border-border bg-muted/40 px-6 py-4">
        <a
          href={directionsLink(place, origin)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-2xl bg-foreground py-3.5 text-center text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
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
    </div>,
    document.body
  )
}
