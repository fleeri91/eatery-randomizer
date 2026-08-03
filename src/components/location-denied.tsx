interface LocationDeniedProps {
  onRetry: () => void
}

export function LocationDenied({ onRetry }: LocationDeniedProps) {
  return (
    <div className="flex flex-1 flex-col justify-center px-5 py-6 sm:px-6">
      <p className="text-[10px] font-semibold tracking-[0.24em] text-primary uppercase">
        Location blocked
      </p>
      <h1 className="mt-3.5 font-heading text-[30px] leading-[1.02] font-bold tracking-tight text-foreground sm:text-[40px]">
        We can't see where you are
      </h1>
      <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground sm:max-w-[46ch] sm:text-[15px]">
        Forkette needs a location to find anything worth eating. Turn it back
        on in settings, or type a neighborhood instead.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-7 w-full bg-primary py-4 font-heading text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase transition-colors hover:bg-secondary hover:text-secondary-foreground"
      >
        Enter it manually
      </button>
    </div>
  )
}
