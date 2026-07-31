import { createPortal } from 'react-dom'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
  onReroll: () => void
  onBlock: (id: string) => void
  onBack: () => void
}

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

// Dark, desaturated theme matching the app's palette so the embedded map
// reads as part of the UI instead of a bright rectangle cut into it.
const CLEAN_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#141110' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9C8F7F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#141110' }] },

  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#37302A' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#C3B7A6' }],
  },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#C3B7A6' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8A7C6B' }],
  },

  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#211C1A' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#1D1918' }],
  },

  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1F1A17' }] },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6E6154' }],
  },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1B211A' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6E7A5F' }],
  },

  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#3A322B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#191514' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#B3A594' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#463C33' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#5A4C40' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1C1817' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#C3B7A6' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.fill',
    stylers: [{ color: '#6B5A4B' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.fill',
    stylers: [{ color: '#312A25' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8F8271' }],
  },

  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6E6154' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#3A322B' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#241F1B' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8A7C6B' }],
  },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0C0A09' }] },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A4038' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0C0A09' }],
  },
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
            <PlaceMap place={place} />
          </div>
        </a>

        <div className="absolute bottom-0 left-0 bg-primary px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-primary-foreground uppercase">
          Tonight, it's
        </div>

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
        <h2 className="font-heading text-[38px] leading-[1.0] font-bold tracking-tight text-foreground">
          {place.name}
        </h2>
        <p className="mt-2.5 text-sm text-muted-foreground">
          {CATEGORY_LABELS[category]} · {place.address}
        </p>

        {place.rating === null && (
          <Badge variant="secondary" className="mt-3 h-auto px-3 py-1.5 text-xs font-medium">
            Not yet rated — you're the scout
          </Badge>
        )}

        <div className="mt-5 flex border border-border">
          <div className="flex-1 border-r border-border p-3">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Rating
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-foreground">
              {place.rating !== null ? place.rating.toFixed(1) : '—'}
            </div>
          </div>
          <div className="flex-1 border-r border-border p-3">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Away
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-foreground">
              {distanceLabel(origin, place.location) ?? '—'}
            </div>
          </div>
          <div className="flex-1 p-3">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Price
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-foreground">
              {price || '—'}
            </div>
          </div>
        </div>

        {place.userRatingCount !== null && place.rating !== null && (
          <p className="mt-2.5 text-xs text-muted-foreground">
            {place.userRatingCount} ratings
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
