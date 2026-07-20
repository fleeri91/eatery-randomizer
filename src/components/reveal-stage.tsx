import { useEffect, useRef, useState } from 'react'

interface RevealStageProps {
  /** Change this (e.g. current place's id) to trigger a new reveal cycle. */
  revealKey: string | null
  /** Pool of names to flash through during the spin — pass your eligible places' names. */
  candidateLabels: string[]
  /** The actual result content, shown once the cycle settles. */
  children: React.ReactNode
  cycleDurationMs?: number
}

type Phase = 'idle' | 'cycling' | 'settled'

export function RevealStage({
  revealKey,
  candidateLabels,
  children,
  cycleDurationMs = 700,
}: RevealStageProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [flashLabel, setFlashLabel] = useState('')
  const prevKey = useRef<string | null>(null)

  useEffect(() => {
    if (revealKey === null) {
      prevKey.current = null
      setPhase('idle')
      return
    }
    if (revealKey === prevKey.current) return
    prevKey.current = revealKey

    // Nothing to spin through — just settle immediately.
    if (candidateLabels.length <= 1) {
      setPhase('settled')
      return
    }

    setPhase('cycling')
    let elapsed = 0
    let timeoutId: number
    const baseStep = 70

    function flash() {
      setFlashLabel(
        candidateLabels[Math.floor(Math.random() * candidateLabels.length)]
      )
      elapsed += baseStep
      if (elapsed < cycleDurationMs) {
        // Ease out — each flash gets a little slower toward the end.
        const nextDelay = baseStep + (elapsed / cycleDurationMs) * 80
        timeoutId = window.setTimeout(flash, nextDelay)
      } else {
        setPhase('settled')
      }
    }

    flash()
    return () => window.clearTimeout(timeoutId)
  }, [revealKey, candidateLabels, cycleDurationMs])

  if (phase === 'cycling') {
    return (
      <div className="text-center text-lg font-medium text-muted-foreground animate-pulse">
        {flashLabel}
      </div>
    )
  }

  if (phase === 'settled') {
    // key={revealKey} forces a remount each reveal, replaying the transition.
    return (
      <div
        key={revealKey}
        className="transition-all duration-300 ease-out"
        style={{ animation: 'reveal-settle 300ms ease-out' }}
      >
        {children}
      </div>
    )
  }

  return null
}
