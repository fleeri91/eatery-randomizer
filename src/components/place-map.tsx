import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { placeInfoLink } from '@/lib/place-links'
import { type Place } from '@/types/google-places'

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

interface PlaceMapProps {
  place: Place
  /** Show the "Open in Google Maps" link overlay (skipped when a parent
   * element already wraps the whole area in its own link, e.g. the mobile
   * hero, to avoid nesting interactive elements). */
  showLink?: boolean
}

export function PlaceMap({ place, showLink = true }: PlaceMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MAPS_API_KEY,
  })

  if (!isLoaded) return null

  return (
    <div className="relative size-full overflow-hidden bg-background">
      <GoogleMap
        mapContainerClassName="size-full"
        center={place.location}
        zoom={15}
        options={staticMapOptions}
      >
        <Marker position={place.location} />
      </GoogleMap>

      {/* Top-left — Google's own attribution/logo and terms link occupy the
          bottom corners even with disableDefaultUI, so that's the one spot
          guaranteed clear of them. */}
      {showLink && (
        <a
          href={placeInfoLink(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 left-3 flex items-center gap-2 border border-border bg-card px-3.5 py-2.5 text-[10px] font-bold tracking-[0.16em] text-foreground uppercase transition-colors hover:border-primary hover:text-primary"
        >
          Open in Google Maps ↗
        </a>
      )}
    </div>
  )
}
