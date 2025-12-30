'use client'

import { Label } from "@/components/ui/label"

interface PeriodSliderProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    label?: string
}

export function PeriodSlider({ value, onChange, min = 3, max = 24, label }: PeriodSliderProps) {
    return (
        <div className="space-y-4 w-full max-w-xs">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">{label || "Período da Projeção"}</Label>
                <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold">
                    {value} meses
                </span>
            </div>
            <div className="relative h-6 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>{min} meses</span>
                <span>{max} meses</span>
            </div>
        </div>
    )
}
