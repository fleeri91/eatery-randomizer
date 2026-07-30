import { useEffect, useRef, useState } from 'react'

interface RevealStageProps {
  /** Change this (e.g. current place's id) to trigger a new reveal cycle. */
  revealKey: string | null
  /** Pool of names to spin through during the roll — pass your eligible places' names. */
  candidateLabels: string[]
  /** The winning label (e.g. current place's name) the reel should land on. */
  targetLabel?: string | null
  /** The actual result content, shown once the reel settles. */
  children: React.ReactNode
  cycleDurationMs?: number
  /** Notified whenever the reel's phase changes — lets a parent (e.g. a
   *  desktop step indicator) track spinning vs. settled without duplicating
   *  the animation logic. */
  onPhaseChange?: (phase: Phase) => void
}

type Phase = 'idle' | 'cycling' | 'landed' | 'settled'

/** How long the landing polish (stamp + underline sweep + frame pop) plays
 *  before the reel gives way to the settled result. Must comfortably cover
 *  win-stamp (500ms) and win-sweep (400ms + 120ms delay). */
const LANDING_POLISH_MS = 560

const ROW_HEIGHT = 64
const WINDOW_HEIGHT = 224
const REPEATS = 6

function easeOutQuart(p: number) {
  return 1 - Math.pow(1 - p, 4)
}

export function RevealStage({
  revealKey,
  candidateLabels,
  targetLabel,
  children,
  cycleDurationMs = 2200,
  onPhaseChange,
}: RevealStageProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const prevKey = useRef<string | null>(null)
  const rafRef = useRef<number | undefined>(undefined)
  const landTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    onPhaseChange?.(phase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (revealKey === null) {
      prevKey.current = null
      setPhase('idle')
      return
    }
    if (revealKey === prevKey.current) return
    prevKey.current = revealKey

    if (candidateLabels.length <= 1) {
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

    setPhase('cycling')
    setProgress(0)
    const start = performance.now()
    const duration = cycleDurationMs + Math.random() * 400

    function step(now: number) {
      const p = Math.min(1, (now - start) / duration)
      setProgress(easeOutQuart(p))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setPhase('landed')
        landTimeoutRef.current = window.setTimeout(
          () => setPhase('settled'),
          LANDING_POLISH_MS
        )
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.clearTimeout(landTimeoutRef.current)
    }
  }, [revealKey, candidateLabels.length, cycleDurationMs])

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.clearTimeout(landTimeoutRef.current)
    },
    []
  )

  if (phase === 'cycling' || phase === 'landed') {
    const landed = phase === 'landed'
    const targetIndex = Math.max(
      targetLabel ? candidateLabels.indexOf(targetLabel) : 0,
      0
    )
    const strip: { label: string; row: number }[] = []
    for (let rep = 0; rep < REPEATS; rep++) {
      candidateLabels.forEach((label, i) =>
        strip.push({ label, row: rep * candidateLabels.length + i })
      )
    }
    const landingRow = (REPEATS - 2) * candidateLabels.length + targetIndex
    const finalOffset =
      landingRow * ROW_HEIGHT - (WINDOW_HEIGHT / 2 - ROW_HEIGHT / 2)
    const translate = landed ? finalOffset : finalOffset * progress
    const blur = landed ? 0 : Math.min(9, (1 - progress) * 26)

    return (
      <div
        className="relative w-full overflow-hidden border border-border bg-card"
        style={{ height: WINDOW_HEIGHT }}
      >
        <div
          className="will-change-transform"
          style={{
            transform: `translateY(${-translate}px)`,
            filter: blur ? `blur(${blur}px)` : 'none',
          }}
        >
          {strip.map((item) => {
            const isWinner = landed && item.row === landingRow
            return (
              <div
                key={item.row}
                className="relative flex items-center justify-center px-4 text-center font-heading text-lg font-bold text-foreground"
                style={{
                  height: ROW_HEIGHT,
                  opacity: landed && !isWinner ? 0.32 : 1,
                  transition: landed ? 'opacity 350ms' : undefined,
                }}
              >
                <span
                  style={
                    isWinner
                      ? {
                          display: 'inline-block',
                          animation:
                            'win-stamp 500ms cubic-bezier(0.2, 0.9, 0.25, 1)',
                        }
                      : undefined
                  }
                >
                  {item.label}
                </span>
                {isWinner && (
                  <span
                    className="pointer-events-none absolute left-1/2 h-1 w-[46px] -translate-x-1/2 bg-primary"
                    style={{ top: 44, animation: 'win-sweep 400ms ease 120ms both' }}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div
          className="pointer-events-none absolute left-2 right-2 border-2 border-primary bg-primary/5"
          style={{
            top: `calc(50% - ${ROW_HEIGHT / 2}px)`,
            height: ROW_HEIGHT,
            animation: landed
              ? 'frame-pop 500ms cubic-bezier(0.2, 0.8, 0.2, 1)'
              : undefined,
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-card to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent" />
      </div>
    )
  }

  if (phase === 'settled') {
    // key={revealKey} forces a remount each reveal, replaying the transition.
    return (
      <div
        key={revealKey}
        style={{
          animation: 'sheet-up 500ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {children}
      </div>
    )
  }

  return null
}
