import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { autocompleteCities, getPlaceLocation } from '@/lib/api'
import { getCurrentPosition } from '@/lib/geo-location'
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
        setQuery('Current location')
        setOpen(false)
        onSelect(coords, 'Current location')
      })
      .catch(() =>
        setError("Couldn't get your location — check browser permissions.")
      )
      .finally(() => setLocating(false))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="city">City or municipality</Label>
      <div className="relative">
        <Input
          id="city"
          placeholder="e.g. Stockholm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
        {open && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => handleSelect(s)}
                >
                  <span className="font-medium">{s.mainText}</span>{' '}
                  <span className="text-muted-foreground">
                    {s.secondaryText}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleUseCurrentLocation}
        disabled={locating}
      >
        📍 {locating ? 'Locating...' : 'Use my current location'}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
