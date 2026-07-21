import { useEffect, useRef, useState } from 'react'
import { Check, LoaderCircle, LocateFixed, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { autocompleteCities, getPlaceLocation } from '@/lib/api'
import { getCurrentPosition } from '@/lib/geo-location'
import { cn } from '@/lib/utils'
import { useFilterStore } from '@/stores/filter-store'
import { type Coordinates, type PlaceSuggestion } from '@/types/google-places'

interface LocationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (location: Coordinates, label: string) => void
}

export function LocationSheet({
  open,
  onOpenChange,
  onSelect,
}: LocationSheetProps) {
  const currentLabel = useFilterStore((s) => s.locationLabel)
  const usingHere = currentLabel === 'Near me'

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionToken = useRef(crypto.randomUUID())

  // Re-seed with whatever's currently selected each time the sheet opens, so
  // reopening shows the active pick instead of always starting blank.
  useEffect(() => {
    if (!open) return
    setQuery(usingHere ? '' : currentLabel)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Depends on `open` too (not just `query`) — reopening with the exact same
  // query text as before wouldn't otherwise re-trigger this, since React
  // bails out when a state update doesn't change the value, leaving the
  // suggestions from the previous seed effect cleared with nothing to
  // repopulate them.
  useEffect(() => {
    if (!open || !query.trim()) {
      setSuggestions([])
      setSearching(false)
      return
    }
    setSearching(true)
    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await autocompleteCities(query, sessionToken.current)
        setSuggestions(results)
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 300) // debounce keystrokes

    return () => window.clearTimeout(timeoutId)
  }, [query, open])

  async function handleSelect(suggestion: PlaceSuggestion) {
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
      .then((coords) => onSelect(coords, 'Near me'))
      .catch(() =>
        setError("Couldn't get your location — check browser permissions.")
      )
      .finally(() => setLocating(false))
  }

  if (!open) return null

  return (
    <>
      <div
        aria-hidden
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-40 bg-foreground/40"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-sm flex-col rounded-t-[28px] border-t border-border bg-card px-5 pt-3.5 pb-6 shadow-[0_-24px_48px_oklch(0.3_0.05_40/0.28)] sm:bottom-6 sm:rounded-b-[28px]"
        style={{ animation: 'sheet-in 420ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-border" />
        <h2 className="mb-3 font-heading text-xl font-extrabold tracking-tight text-foreground">
          Where to?
        </h2>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className={cn(
            'mb-3 flex w-full shrink-0 items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors disabled:opacity-60',
            usingHere
              ? 'border-primary bg-secondary'
              : 'border-border bg-background hover:bg-muted'
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {locating ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LocateFixed className="size-4" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'block text-base font-bold',
                  usingHere ? 'text-primary' : 'text-foreground'
                )}
              >
                {locating ? 'Locating…' : 'Use my location'}
              </span>
              {usingHere && !locating && (
                <Check className="size-4 shrink-0 text-primary" />
              )}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {usingHere
                ? 'Currently selected'
                : "Pick from what's around me right now"}
            </span>
          </span>
        </button>

        <div className="my-1 flex shrink-0 items-center gap-2.5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            or search a place
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mt-2 flex shrink-0 items-center gap-2.5 rounded-2xl border border-border bg-background px-3.5 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing a city…"
            autoComplete="off"
            className="h-auto border-0 bg-transparent p-0 font-semibold text-base text-foreground focus-visible:ring-0"
          />
        </div>

        {error && (
          <p className="mt-2 shrink-0 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="mt-3 -mx-1.5 flex-1 overflow-y-auto px-1.5">
          {suggestions.map((s) => {
            // Only mark a row as the active pick when it's an unambiguous
            // match — "Stockholm" alone can't tell Sweden from Wisconsin
            // apart, and we don't persist enough to disambiguate, so a
            // same-name collision means none of them get the checkmark
            // rather than misleadingly marking all of them.
            const selected =
              !usingHere &&
              s.mainText === currentLabel &&
              suggestions.filter((r) => r.mainText === currentLabel).length ===
                1
            return (
              <button
                key={s.placeId}
                type="button"
                onClick={() => handleSelect(s)}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-border/70 px-1 py-3 text-left last:border-0 hover:bg-muted',
                  selected && 'bg-secondary/60'
                )}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <span className="size-2.5 shrink-0 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-foreground">
                    {s.mainText}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {s.secondaryText}
                  </span>
                </span>
                {selected && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            )
          })}
          {!searching && query.trim() && suggestions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No places match "{query}"
            </p>
          )}
        </div>
      </div>
    </>
  )
}
