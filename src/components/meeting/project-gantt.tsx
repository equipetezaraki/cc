'use client'

import { format, addDays, differenceInDays, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GanttChartSquare } from "lucide-react"

interface GanttProject {
    id: string
    name: string
    clientName: string
    implementationStart: Date
    implementationEnd: Date | null
    maintenanceStart: Date | null
    maintenanceEnd: Date | null
}

interface ProjectGanttProps {
    projects: GanttProject[]
}

export function ProjectGantt({ projects }: ProjectGanttProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
        setScrollLeft(scrollContainerRef.current.scrollLeft)
        scrollContainerRef.current.style.cursor = 'grabbing'
        scrollContainerRef.current.style.userSelect = 'none'
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollContainerRef.current.offsetLeft
        const walk = (x - startX) * 2
        scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab'
            scrollContainerRef.current.style.userSelect = 'auto'
        }
    }

    useEffect(() => {
        if (scrollContainerRef.current) {
            // Scroll to today broadly (approximate)
            const today = new Date()
            const daysDiff = differenceInDays(today, rangeStart)
            const scrollPos = (daysDiff * minDayWidth) - 300 // Center a bit
            scrollContainerRef.current.scrollLeft = Math.max(0, scrollPos)
            scrollContainerRef.current.style.cursor = 'grab'
        }
    }, [])

    if (projects.length === 0) {
        return null
    }

    // Determine timeline range
    const dates = projects.flatMap(p => [
        p.implementationStart,
        p.implementationEnd,
        p.maintenanceEnd
    ].filter((d): d is Date => d !== null))

    if (dates.length === 0) return null

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start a bit before the earliest date or today
    const rangeStart = startOfWeek(minDate)
    const rangeEnd = endOfWeek(addDays(maxDate, 14)) // Add buffer

    const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd })

    const minDayWidth = 40
    const timelineWidth = allDays.length * minDayWidth

    const getPosition = (start: Date, end: Date) => {
        const daysFromStart = differenceInDays(start, rangeStart)
        const duration = differenceInDays(end, start) + 1
        return {
            left: daysFromStart * minDayWidth,
            width: Math.max(duration * minDayWidth, minDayWidth)
        }
    }

    return (
        <Card className="mb-8 w-full min-w-0 overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GanttChartSquare className="h-5 w-5" />
                    Cronograma Geral de Projetos
                </CardTitle>
                <div className="flex gap-4 text-sm mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                        <span>Implementação</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                        <span>Manutenção (Go-live)</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden w-full">
                <div
                    ref={scrollContainerRef}
                    className="w-full min-w-0 overflow-x-auto border-t border-border bg-slate-50 dark:bg-slate-900/50"
                    style={{ maxWidth: '100%' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div style={{ width: `${timelineWidth + 250}px` }} className="flex flex-col h-full"> {/* +250 for Sidebar */}
                        {/* Timeline Header */}
                        <div className="grid grid-cols-[250px_1fr] border-b border-border sticky top-0 z-20 bg-white dark:bg-card">
                            <div className="px-4 py-2 font-semibold text-xs text-muted-foreground border-r border-border flex items-end pb-2">
                                PROJETO
                            </div>
                            <div className="relative h-10">
                                <div className="flex absolute inset-0">
                                    {allDays.map((day, index) => {
                                        const isFirstOfMonth = day.getDate() === 1
                                        const isToday = isSameDay(day, today)
                                        return (
                                            <div
                                                key={index}
                                                className={`flex-shrink-0 border-r border-border/50 text-[10px] flex items-end justify-center pb-2 ${isToday ? 'bg-blue-100/50 dark:bg-blue-900/20 font-bold' : ''}`}
                                                style={{ width: `${minDayWidth}px` }}
                                            >
                                                {isFirstOfMonth ? (
                                                    <span className="font-bold">{format(day, 'MMM', { locale: ptBR }).toUpperCase()}</span>
                                                ) : (
                                                    <span className="text-muted-foreground/70">{format(day, 'dd')}</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Projects Rows */}
                        <div className="max-h-[200px] w-full max-w-full overflow-y-auto custom-scrollbar">
                            <div className="relative">
                                {/* Vertical Grid Lines (Background) */}
                                <div className="absolute inset-0 grid grid-cols-[250px_1fr] pointer-events-none">
                                    <div className="border-r border-border bg-white dark:bg-card z-10"></div>
                                    <div className="flex h-full">
                                        {allDays.map((day, index) => {
                                            const isWeekend = day.getDay() === 0 || day.getDay() === 6
                                            const isToday = isSameDay(day, today)
                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex-shrink-0 border-r border-border/30 h-full ${isWeekend ? 'bg-slate-100/30 dark:bg-slate-800/30' : ''} ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-200' : ''}`}
                                                    style={{ width: `${minDayWidth}px` }}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>

                                {projects.map(project => (
                                    <div key={project.id} className="grid grid-cols-[250px_1fr] border-b border-border/50 relative hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">

                                        {/* Sidebar Info */}
                                        <div className="px-4 py-3 border-r border-border bg-white/50 dark:bg-card/50 backdrop-blur-sm z-10 relative">
                                            <div className="text-sm font-medium truncate" title={project.name}>{project.name}</div>
                                            <div className="text-xs text-muted-foreground truncate" title={project.clientName}>{project.clientName}</div>
                                        </div>

                                        {/* Bars Container */}
                                        <div className="relative h-full min-h-[50px]">
                                            {/* Implementation Bar */}
                                            {project.implementationEnd && (
                                                <div
                                                    className="absolute top-2 h-4 bg-blue-500 rounded-sm shadow-sm hover:brightness-110 transition-all cursor-help z-20"
                                                    style={getPosition(project.implementationStart, project.implementationEnd)}
                                                    title={`Implementação\n${format(project.implementationStart, 'dd/MM')} - ${format(project.implementationEnd, 'dd/MM')}`}
                                                />
                                            )}

                                            {/* Maintenance Bar */}
                                            {project.maintenanceStart && project.maintenanceEnd && (
                                                <div
                                                    className="absolute top-7 h-4 bg-emerald-500 rounded-sm shadow-sm hover:brightness-110 transition-all cursor-help z-20"
                                                    style={getPosition(project.maintenanceStart, project.maintenanceEnd)}
                                                    title={`Manutenção\n${format(project.maintenanceStart, 'dd/MM')} - ${format(project.maintenanceEnd, 'dd/MM')}`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
