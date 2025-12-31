"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { addMonths, eachMonthOfInterval, endOfMonth, format, isAfter, isBefore, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"

interface MonthRangeFilterProps {
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    minDate: Date
}

export function MonthRangeFilter({
    date,
    setDate,
    minDate,
}: MonthRangeFilterProps) {
    const [startMonth, setStartMonth] = React.useState<string>("")
    const [endMonth, setEndMonth] = React.useState<string>("")

    // Generate list of available months from minDate to today
    const months = React.useMemo(() => {
        const today = new Date()
        // Ensure minDate is valid, otherwise fallback to 1 year ago
        const start = minDate && !isNaN(minDate.getTime()) ? minDate : subMonths(today, 12)

        // If start is after today (unlikely but possible with bad data), prevent crash
        if (isAfter(start, today)) {
            return [today]
        }

        return eachMonthOfInterval({
            start: startOfMonth(start),
            end: today
        }).reverse() // Newest first
    }, [minDate])

    // Sync internal state with external date prop on mount or update
    React.useEffect(() => {
        if (date?.from) {
            setStartMonth(startOfMonth(date.from).toISOString())
        }
        if (date?.to) {
            setEndMonth(startOfMonth(date.to).toISOString())
        } else if (date?.from) {
            // If to is undefined but from is defined, usually means single day selection or in progress
            // For month filter, we usually default 'to' to end of 'from' month if missing, 
            // but here we want distinct months. 
            // Let's leave endMonth empty or match from if we want single month range.
            setEndMonth(startOfMonth(date.from).toISOString())
        }
    }, [date])


    const handleStartChange = (value: string) => {
        const newStart = new Date(value)
        setStartMonth(value)

        let newEnd = endMonth ? new Date(endMonth) : newStart

        // If new start is after current end, reset end to new start
        if (isAfter(newStart, newEnd)) {
            newEnd = newStart
            setEndMonth(value)
        }

        setDate({
            from: startOfMonth(newStart),
            to: endOfMonth(newEnd)
        })
    }

    const handleEndChange = (value: string) => {
        const newEnd = new Date(value)
        setEndMonth(value)

        let newStart = startMonth ? new Date(startMonth) : newEnd

        // If new end is before current start, reset start to new end
        if (isBefore(newEnd, newStart)) {
            newStart = newEnd
            setStartMonth(value)
        }

        setDate({
            from: startOfMonth(newStart),
            to: endOfMonth(newEnd)
        })
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />

                <div className="flex items-center gap-2">
                    <Select value={startMonth} onValueChange={handleStartChange}>
                        <SelectTrigger className="w-[110px] h-8 border-0 focus:ring-0 px-1 text-xs">
                            <SelectValue placeholder="Início" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={`start-${month.toISOString()}`} value={month.toISOString()} className="text-xs">
                                    {format(month, "MMM/yy", { locale: ptBR })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <span className="text-muted-foreground text-xs">até</span>

                    <Select value={endMonth} onValueChange={handleEndChange}>
                        <SelectTrigger className="w-[110px] h-8 border-0 focus:ring-0 px-1 text-xs">
                            <SelectValue placeholder="Fim" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={`end-${month.toISOString()}`} value={month.toISOString()} className="text-xs">
                                    {format(month, "MMM/yy", { locale: ptBR })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
