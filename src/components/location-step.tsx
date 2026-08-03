import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { placeLocationQueryOptions, useCityAutocomplete } from '@/lib/queries'
import { getCurrentPosition, isPermissionDenied } from '@/lib/geo-location'
import { type Coordinates, type PlaceSuggestion } from '@/types/google-places'

interface LocationStepProps {
  onSelect: (location: Coordinates, label: string) => void
  onDenied: () => void
}

// Full-screen "step one" location picker — replaces the old modal/sheet.
// Always mounted fresh by the parent (no open/close prop), so autocomplete
// is unconditionally enabled here.
export function LocationStep({ onSelect, onDenied }: LocationStepProps) {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionToken = useRef(crypto.randomUUID())

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query), 300)
    return () => window.clearTimeout(timeoutId)
  }, [query])

  const normalizedQuery = debouncedQuery.trim()
  const { data: suggestions = [], isFetching: searching } = useCityAutocomplete(
    normalizedQuery,
    () => sessionToken.current,
    true
  )

  async function handleSelect(suggestion: PlaceSuggestion) {
    setError(null)
    try {
      const location = await queryClient.fetchQuery(
        placeLocationQueryOptions(suggestion.placeId, sessionToken.current)
      )
      onSelect(location, suggestion.mainText)
    } catch {
      setError("Couldn't look up that place. Try again.")
    } finally {
      sessionToken.current = crypto.randomUUID()
    }
  }

  function handleUseCurrentLocation() {
    setLocating(true)
    setError(null)
    getCurrentPosition()
      .then((coords) => onSelect(coords, 'Near me'))
      .catch((err: unknown) => {
        if (isPermissionDenied(err)) {
          onDenied()
          return
        }
        setError("Couldn't get your location. Try searching instead.")
      })
      .finally(() => setLocating(false))
  }

  return (
    <div className="flex flex-1 flex-col px-5 py-6 sm:px-6">
      <p className="text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
        Step one
      </p>
      <h1 className="mt-3.5 font-heading text-[34px] leading-[0.98] font-bold tracking-tight text-foreground sm:text-[44px]">
        Where are you eating?
      </h1>
      <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground sm:max-w-[46ch] sm:text-[15px]">
        Everything else is optional. We only need a starting point to draw the
        radius around.
      </p>

      <div className="mt-7 flex items-center gap-3 border border-border bg-background px-4 py-3.5 transition-colors focus-within:border-primary">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city…"
          autoComplete="off"
          className="h-auto border-0 bg-transparent p-0 font-semibold text-base text-foreground focus-visible:ring-0"
        />
      </div>

      {error && (
        <p className="mt-2.5 text-sm font-medium text-destructive">{error}</p>
      )}

      {normalizedQuery.length >= 2 && (
        <div className="mt-5 flex flex-col">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              type="button"
              onClick={() => handleSelect(s)}
              className="flex items-baseline justify-between gap-3.5 border-b border-border/70 py-3.5 text-left last:border-0 hover:border-primary"
            >
              <span className="truncate text-[15px] font-semibold text-foreground">
                {s.mainText}
              </span>
              <span className="shrink-0 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                {s.secondaryText}
              </span>
            </button>
          ))}
          {!searching && suggestions.length === 0 && (
            <p className="py-4 text-sm leading-relaxed text-muted-foreground">
              Nothing matches "{normalizedQuery}". Try a different city.
            </p>
          )}
        </div>
      )}

      <div className="flex-1" />

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="mt-7 flex w-full shrink-0 items-center justify-center gap-2.5 bg-primary py-5 font-heading text-sm font-bold tracking-[0.22em] text-primary-foreground uppercase transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:opacity-70"
      >
        {locating ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <span className="size-2 shrink-0 rounded-full bg-primary-foreground" />
        )}
        Use my location
      </button>
    </div>
  )
}
