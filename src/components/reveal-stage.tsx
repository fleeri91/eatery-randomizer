import { useEffect, useRef, useState } from 'react'

export interface RevealCandidate {
  label: string
  meta?: string
}

interface RevealStageProps {
  /** Change this (e.g. current place's id) to trigger a new reveal cycle. */
  revealKey: string | null
  /** Pool to tick through during the roll — pass your eligible places. */
  candidates: RevealCandidate[]
  /** The winning label (e.g. current place's name) the ticks should land on. */
  targetLabel?: string | null
  /** Shown under the ticking name while cycling, e.g. "12 places in play". */
  poolLabel?: string
  /** The actual result content, shown once the reel settles. */
  children: React.ReactNode
}

type Phase = 'idle' | 'ticking' | 'settled'

/** Extra pause on the winning name before giving way to the settled result. */
const SETTLE_DELAY_MS = 500

function tickDurationMs(i: number, total: number) {
  return Math.min(300, Math.round(55 + 365 * Math.pow(i / total, 3.2)))
}

export function RevealStage({
  revealKey,
  candidates,
  targetLabel,
  poolLabel,
  children,
}: RevealStageProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [tickIndex, setTickIndex] = useState(0)
  const [tickMs, setTickMs] = useState(180)
  const [current, setCurrent] = useState<RevealCandidate | null>(null)
  const prevKey = useRef<string | null>(null)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (revealKey === null) {
      prevKey.current = null
      setPhase('idle')
      return
    }
    if (revealKey === prevKey.current) return
    prevKey.current = revealKey

    if (candidates.length <= 1) {
      setPhase('settled')
      return
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) {
      setPhase('settled')
      return
    }

    const targetIndex = Math.max(
      targetLabel ? candidates.findIndex((c) => c.label === targetLabel) : 0,
      0
    )
    const total = candidates.length > 4 ? 22 : 16

    setPhase('ticking')

    let i = 0
    function tick() {
      const last = i >= total
      const item = last ? candidates[targetIndex] : candidates[(i + 1) % candidates.length]
      const ms = tickDurationMs(i, total)
      setCurrent(item)
      setTickIndex(i)
      setTickMs(ms)
      if (last) {
        timeoutRef.current = window.setTimeout(
          () => setPhase('settled'),
          SETTLE_DELAY_MS
        )
        return
      }
      i++
      timeoutRef.current = window.setTimeout(tick, ms)
    }
    tick()

    return () => window.clearTimeout(timeoutRef.current)
    // candidates/targetLabel are read fresh whenever revealKey changes (the
    // parent always re-renders with the matching pool right before bumping
    // it) — depending on the `candidates` array itself would re-run this
    // effect (and cancel the in-flight tick chain) on every unrelated
    // parent re-render, since a fresh array is created each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealKey])

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  if (phase === 'ticking' && current) {
    return (
      <div className="flex flex-col items-center gap-5">
        <p className="animate-pulse text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Consulting the whim
        </p>
        <div className="w-full overflow-hidden border-t border-b border-border py-9">
          <div
            key={tickIndex}
            className="truncate px-6 text-center font-heading text-4xl leading-tight font-bold text-foreground"
            style={{ animation: `tick-in ${tickMs}ms cubic-bezier(0.2, 0.7, 0.3, 1)` }}
          >
            {current.label}
          </div>
          {current.meta && (
            <div
              key={`${tickIndex}-meta`}
              className="mt-3 text-center text-[10px] tracking-[0.18em] text-muted-foreground uppercase"
              style={{ animation: `fade-in ${tickMs}ms ease-out` }}
            >
              {current.meta}
            </div>
          )}
        </div>
        {poolLabel && (
          <p className="text-[10px] tracking-[0.22em] text-muted-foreground/70 uppercase">
            {poolLabel}
          </p>
        )}
      </div>
    )
  }

  if (phase === 'settled') {
    return <>{children}</>
  }

  return null
}
