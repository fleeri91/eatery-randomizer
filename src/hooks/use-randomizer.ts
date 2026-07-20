import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Place } from '@/types/google-places'
import { filterByRating, pickRandom } from '@/lib/randomizer'

export function useRandomizer(places: Place[] | undefined, minRating: number) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [current, setCurrent] = useState<Place | null>(null)

  const eligible = useMemo(
    () => filterByRating(places ?? [], minRating),
    [places, minRating]
  )

  // New search results in → start a fresh cycle.
  useEffect(() => {
    setSeenIds(new Set())
    setCurrent(null)
  }, [places])

  const randomize = useCallback(() => {
    if (eligible.length === 0) {
      setCurrent(null)
      return
    }

    let pool = eligible.filter((p) => !seenIds.has(p.id))
    let nextSeen = seenIds

    if (pool.length === 0) {
      // Pool exhausted — reset the cycle, but avoid repeating the same
      // place back-to-back if there's more than one option.
      nextSeen = new Set()
      pool = eligible.filter((p) => p.id !== current?.id)
      if (pool.length === 0) pool = eligible
    }

    const picked = pickRandom(pool)!
    setCurrent(picked)
    setSeenIds(new Set(nextSeen).add(picked.id))
  }, [eligible, seenIds, current])

  return {
    current,
    randomize,
    poolSize: eligible.length,
    eligible,
    exhausted: eligible.length > 0 && seenIds.size >= eligible.length,
  }
}
