import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Place } from '@/types/google-places'
import { filterByRating, pickRandom } from '@/lib/randomizer'

export function useRandomizer(places: Place[] | undefined, minRating: number) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set())
  const [current, setCurrent] = useState<Place | null>(null)

  const eligible = useMemo(() => {
    const rated = filterByRating(places ?? [], minRating)
    return rated.filter((p) => !blockedIds.has(p.id))
  }, [places, minRating, blockedIds])

  useEffect(() => {
    setSeenIds(new Set())
    setBlockedIds(new Set())
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
      nextSeen = new Set()
      pool = eligible.filter((p) => p.id !== current?.id)
      if (pool.length === 0) pool = eligible
    }
    const picked = pickRandom(pool)!
    setCurrent(picked)
    setSeenIds(new Set(nextSeen).add(picked.id))
  }, [eligible, seenIds, current])

  // If the current pick falls out of `eligible` (just got blocked, or a
  // filter change excluded it), immediately replace it.
  useEffect(() => {
    if (current && !eligible.some((p) => p.id === current.id)) {
      randomize()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible])

  const block = useCallback((id: string) => {
    setBlockedIds((prev) => new Set(prev).add(id))
  }, [])

  return {
    current,
    randomize,
    block,
    poolSize: eligible.length,
    eligible,
    exhausted: eligible.length > 0 && seenIds.size >= eligible.length,
  }
}
