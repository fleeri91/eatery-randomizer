import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Coordinates, type Place, type PriceLevel } from '@/types/google-places'
import {
  filterByDistance,
  filterByPrice,
  filterByRating,
  pickRandom,
} from '@/lib/randomizer'

export function useRandomizer(
  places: Place[] | undefined,
  origin: Coordinates | null,
  radiusMeters: number,
  minRating: number,
  priceLevels: ReadonlySet<PriceLevel>
) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set())
  const [current, setCurrent] = useState<Place | null>(null)
  const [drawCount, setDrawCount] = useState(0)

  const eligible = useMemo(() => {
    const nearby = origin
      ? filterByDistance(places ?? [], origin, radiusMeters)
      : (places ?? [])
    const rated = filterByRating(nearby, minRating)
    const priced = filterByPrice(rated, priceLevels)
    return priced.filter((p) => !blockedIds.has(p.id))
  }, [places, origin, radiusMeters, minRating, priceLevels, blockedIds])

  useEffect(() => {
    setSeenIds(new Set())
    setBlockedIds(new Set())
    setCurrent(null)
    setDrawCount(0)
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
    setDrawCount((n) => n + 1)
  }, [eligible, seenIds, current])

  // Draw automatically whenever there's no valid current pick — on first
  // load, after the current pick falls out of `eligible` (just got blocked,
  // or a filter change excluded it), or once results arrive for a fresh
  // search.
  useEffect(() => {
    if (eligible.length === 0) return
    if (!current || !eligible.some((p) => p.id === current.id)) {
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
    drawCount,
  }
}
