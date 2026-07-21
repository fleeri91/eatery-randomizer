import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, LocateFixed } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { autocompleteCities, getPlaceLocation } from '@/lib/api'
import { getCurrentPosition } from '@/lib/geo-location'
import { cn } from '@/lib/utils'
import { type Coordinates, type PlaceSuggestion } from '@/types/google-places'

interface LocationAutocompleteProps {
  onSelect: (location: Coordinates, label: string) => void
}

export function LocationAutocomplete({ onSelect }: LocationAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingHere, setUsingHere] = useState(false)
  const sessionToken = useRef(crypto.randomUUID())

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await autocompleteCities(query, sessionToken.current)
        setSuggestions(results)
        setOpen(results.length > 0)
      } catch (err) {
        console.error(err)
      }
    }, 300) // debounce keystrokes

    return () => window.clearTimeout(timeoutId)
  }, [query])

  async function handleSelect(suggestion: PlaceSuggestion) {
    setQuery(suggestion.mainText)
    setOpen(false)
    setError(null)
    setUsingHere(false)
    try {
      const location = await getPlaceLocation(
        suggestion.placeId,
        sessionToken.current
      )
      onSelect(location, suggestion.mainText)
    } catch {
      setError("Couldn't look up that place. Try again.")
    } finally {
      sessionToken.current = crypto.randomUUID() // fresh token for next search
    }
  }

  function handleUseCurrentLocation() {
    setLocating(true)
    setError(null)
    getCurrentPosition()
      .then((coords) => {
        setQuery('')
        setOpen(false)
        setUsingHere(true)
        onSelect(coords, 'Current location')
      })
      .catch(() =>
        setError("Couldn't get your location — check browser permissions.")
      )
      .finally(() => setLocating(false))
  }

  return (
    <div className="space-y-2">
      <Label
        htmlFor="city"
        className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
      >
        Where
      </Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3.5">
            <span className="size-4 shrink-0 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-primary" />
            <Input
              id="city"
              placeholder="City or neighborhood"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setUsingHere(false)
              }}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              onBlur={() => window.setTimeout(() => setOpen(false), 150)}
              autoComplete="off"
              className="h-auto border-0 bg-transparent p-0 font-semibold text-base text-foreground focus-visible:ring-0"
            />
          </div>
          {open && (
            <ul className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
              {suggestions.map((s) => (
                <li key={s.placeId}>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted"
                    onClick={() => handleSelect(s)}
                  >
                    <span className="font-semibold">{s.mainText}</span>{' '}
                    <span className="text-muted-foreground">
                      {s.secondaryText}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          aria-label="Use my location"
          title="Use my location"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-colors disabled:opacity-60',
            usingHere
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-foreground hover:bg-muted'
          )}
        >
          {locating ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <LocateFixed className="size-5" />
          )}
        </button>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
