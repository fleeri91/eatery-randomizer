import { MapPin } from 'lucide-react'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="city"
        className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
      >
        Where
      </Label>
      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3.5">
        <MapPin className="size-4 shrink-0 fill-primary text-primary" />
        <Input
          id="city"
          placeholder="City or neighborhood"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="h-auto border-0 bg-transparent p-0 font-semibold text-base text-foreground focus-visible:ring-0"
        />
      </div>
    </div>
  )
}
