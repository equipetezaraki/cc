'use client'

import { format, addDays, differenceInDays, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GanttChartSquare } from "lucide-react"

interface GanttPhase {
    name: string
    start: Date
    end: Date | null
    color: string
}

interface GanttProject {
    id: string
    name: string
    clientName: string
    phases: GanttPhase[]
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

    // Determine timeline range
    const allDates = projects.flatMap(p =>
        p.phases.flatMap(ph => [ph.start, ph.end].filter((d): d is Date => d instanceof Date || (typeof d === 'string' && !isNaN(Date.parse(d)))))
    ).map(d => d instanceof Date ? d : new Date(d))

    if (allDates.length === 0) return null

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Dynamic timeline range: from earliest project date to latest + 5 days
    const rangeStart = startOfWeek(minDate < today ? minDate : today, { locale: ptBR })
    const rangeEnd = addDays(maxDate, 5)
    const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd })

    const minDayWidth = 30 // Reduced from 40 for compression
    const sidebarWidth = 260 // Increased to ensure project names are visible

    useEffect(() => {
        if (scrollContainerRef.current) {
            const daysDiff = differenceInDays(today, rangeStart)
            const scrollPos = (daysDiff * minDayWidth) - (sidebarWidth / 2)
            scrollContainerRef.current.scrollLeft = Math.max(0, scrollPos)
        }
    }, [])

    const getPosition = (start: Date, end: Date | null) => {
        const actualEnd = end || addDays(start, 1) // Default to 1 day if no end
        const daysFromStart = differenceInDays(start, rangeStart)
        const duration = Math.max(0.5, differenceInDays(actualEnd, start)) // Allow small durations
        return {
            left: daysFromStart * minDayWidth,
            width: duration * minDayWidth
        }
    }

    return (
        <Card className="mb-8 w-full border-white/[0.03] shadow-none bg-[#1c1d3e]/15 overflow-hidden">
            <CardContent className="p-0 relative">
                <div
                    ref={scrollContainerRef}
                    className="max-h-[60vh] min-h-[400px] w-full overflow-x-auto overflow-y-auto select-none bg-slate-100/10 dark:bg-slate-900/10 transition-colors"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: 'grab' }}
                >
                    <div className="relative flex flex-col min-w-max pb-4">
                        {/* Linha de Datas (Sticky) */}
                        <div className="flex bg-[#121226] border-b border-white/[0.03] sticky top-0 z-40">
                            <div className="flex-shrink-0 border-r border-white/[0.03] bg-[#121226] flex items-center px-6 py-4 sticky left-0 z-50 shadow-[6px_0_15px_-4px_rgba(0,0,0,0.2)]" style={{ width: `${sidebarWidth}px` }}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projeto / Cliente</span>
                            </div>
                            <div className="flex">
                                {allDays.map((day, index) => {
                                    const isMonthStart = day.getDate() === 1
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6
                                    return (
                                        <div
                                            key={index}
                                            className={`flex-shrink-0 border-r border-white/[0.03] text-center py-4 relative ${isWeekend ? 'bg-white/[0.02]' : ''}`}
                                            style={{ width: `${minDayWidth}px` }}
                                        >
                                            {isMonthStart && (
                                                <span className="absolute -top-0.5 left-1.5 text-[8px] font-bold text-blue-500 uppercase tracking-tighter">
                                                    {format(day, 'MMM', { locale: ptBR })}
                                                </span>
                                            )}
                                            <span className={`text-[10px] font-bold ${isSameDay(day, today) ? 'text-white bg-rose-500 px-1.5 py-0.5 rounded shadow-lg shadow-rose-500/40' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {format(day, 'dd')}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="relative">
                            {/* Grid Background */}
                            <div className="absolute inset-0 pointer-events-none flex">
                                <div className="sticky left-0 border-r border-white/5 bg-[#0f172a]/40 z-10 shadow-[6px_0_15px_-4px_rgba(0,0,0,0.3)]" style={{ width: `${sidebarWidth}px`, flexShrink: 0 }}></div>
                                <div className="flex h-full relative">
                                    {allDays.map((_, index) => (
                                        <div key={index} className="flex-shrink-0 border-r border-white/[0.03] h-full" style={{ width: `${minDayWidth}px` }} />
                                    ))}
                                    {/* Today Pivot Line */}
                                    <div
                                        className="absolute top-0 bottom-0 w-[2px] bg-rose-500/50 z-30"
                                        style={{ left: `${differenceInDays(today, rangeStart) * minDayWidth + (minDayWidth / 2)}px` }}
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-rose-500 text-[8px] text-white font-bold rounded-full uppercase whitespace-nowrap shadow-xl border border-white/20">Hoje</div>
                                    </div>
                                </div>
                            </div>

                            {/* Conteúdo Real */}
                            <div className="relative z-20">
                                {projects.map((project) => (
                                    <div key={project.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all group flex">
                                        <div className="px-6 py-5 border-r border-white/[0.03] flex flex-col justify-center bg-[#121226] transition-all sticky left-0 z-30 shadow-[6px_0_15px_-4px_rgba(0,0,0,0.2)]" style={{ width: `${sidebarWidth}px`, flexShrink: 0 }}>
                                            <div className="text-[12px] font-bold text-slate-200 truncate flex items-center gap-2" title={project.name}>
                                                <div className="w-2 h-2 rounded-full bg-[#4dbaaf] shrink-0 shadow-[0_0_8px_rgba(77,186,175,0.3)]" />
                                                {project.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium tracking-wider truncate uppercase mt-1 pl-4" title={project.clientName}>
                                                {project.clientName}
                                            </div>
                                        </div>

                                        <div className="relative h-[72px] py-4">
                                            {project.phases.map((phase, idx) => {
                                                const start = phase.start instanceof Date ? phase.start : new Date(phase.start)
                                                const end = phase.end ? (phase.end instanceof Date ? phase.end : new Date(phase.end)) : null

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="absolute h-8 rounded-md transition-all cursor-pointer flex items-center px-3 border border-white/5"
                                                        style={{
                                                            ...getPosition(start, end),
                                                            backgroundColor: '#4dbaaf',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)'
                                                        }}
                                                        title={`${phase.name}: ${format(start, 'dd/MM')} até ${end ? format(end, 'dd/MM') : '?'}`}
                                                    >
                                                        <span className="text-[10px] text-[#121226] font-bold truncate relative z-10">{phase.name}</span>
                                                    </div>
                                                )
                                            })}
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
