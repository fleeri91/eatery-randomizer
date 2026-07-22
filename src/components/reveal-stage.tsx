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
}

type Phase = 'idle' | 'cycling' | 'settled'

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
}: RevealStageProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const prevKey = useRef<string | null>(null)
  const rafRef = useRef<number | undefined>(undefined)

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
        setPhase('settled')
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [revealKey, candidateLabels.length, cycleDurationMs])

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    },
    []
  )

  if (phase === 'cycling') {
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
    const translate = finalOffset * progress
    const blur = Math.min(9, (1 - progress) * 26)

    return (
      <div
        className="relative w-full overflow-hidden rounded-3xl border border-border bg-card"
        style={{ height: WINDOW_HEIGHT }}
      >
        <div
          className="will-change-transform"
          style={{
            transform: `translateY(${-translate}px)`,
            filter: blur ? `blur(${blur}px)` : 'none',
          }}
        >
          {strip.map((item) => (
            <div
              key={item.row}
              className="flex items-center justify-center px-4 text-center font-heading text-lg font-extrabold text-foreground"
              style={{ height: ROW_HEIGHT }}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute left-2 right-2 rounded-2xl border-2 border-primary bg-primary/5"
          style={{ top: `calc(50% - ${ROW_HEIGHT / 2}px)`, height: ROW_HEIGHT }}
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
