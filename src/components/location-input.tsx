import { Input } from './ui/input'
import { Label } from './ui/label'

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="city">City or municipality</Label>
      <Input
        id="city"
        placeholder="e.g. Stockholm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  )
}
