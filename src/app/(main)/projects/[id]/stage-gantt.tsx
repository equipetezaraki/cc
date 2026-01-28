'use client'

import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, Circle } from "lucide-react"
import { useRef, useState, useEffect } from "react"

interface ProjectStage {
    id: string
    stageNumber: number
    funnelNumber: number | null
    isCompleted: boolean
    startDate: Date | null
    endDate: Date | null
}

interface StageTemplate {
    id: string
    name: string
    stageNumber: number
}

interface StageGanttProps {
    stages: ProjectStage[]
    projectStartDate: Date
    funnelCount: number
    templates: StageTemplate[]
}

export function StageGantt({ stages, projectStartDate, funnelCount, templates }: StageGanttProps) {
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
            scrollContainerRef.current.style.cursor = 'grab'
        }
    }, [])

    if (stages.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground border border-border rounded-lg bg-card">
                Nenhuma etapa encontrada.
            </div>
        )
    }

    // Build timeline from stored dates
    const stageTimeline: Array<{
        stage: ProjectStage
        name: string
        startDate: Date
        endDate: Date
    }> = []

    // Agrupar stages por número
    const stagesByNumber = stages.reduce((acc, stage) => {
        if (!acc[stage.stageNumber]) acc[stage.stageNumber] = []
        acc[stage.stageNumber].push(stage)
        return acc
    }, {} as Record<number, ProjectStage[]>)

    // Map templates for easier lookup
    const templateMap = templates.reduce((acc, t) => {
        acc[t.stageNumber] = t.name
        return acc
    }, {} as Record<number, string>)

    const sortedStageNumbers = Object.keys(stagesByNumber).map(Number).sort((a, b) => a - b)

    for (const stageNum of sortedStageNumbers) {
        const stageItems = stagesByNumber[stageNum] || []
        const stageName = templateMap[stageNum] || `Etapa ${stageNum}`

        if (stageItems.length > 1 || (stageItems.length > 0 && stageItems[0].funnelNumber !== null)) {
            // Multiple items or explicit funnel number -> render as funnels
            stageItems.sort((a, b) => (a.funnelNumber || 0) - (b.funnelNumber || 0))
            stageItems.forEach((stage) => {
                if (stage.startDate && stage.endDate) {
                    stageTimeline.push({
                        stage,
                        name: stage.funnelNumber ? `Funil ${stage.funnelNumber}` : stageName,
                        startDate: new Date(stage.startDate),
                        endDate: new Date(stage.endDate)
                    })
                }
            })
        } else {
            // Single standard item
            if (stageItems.length > 0 && stageItems[0].startDate && stageItems[0].endDate) {
                stageTimeline.push({
                    stage: stageItems[0],
                    name: stageName,
                    startDate: new Date(stageItems[0].startDate),
                    endDate: new Date(stageItems[0].endDate)
                })
            }
        }
    }

    // Calcular range de datas
    const allDates = stageTimeline.flatMap(t => [t.startDate, t.endDate])
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Zerar horas para comparação correta

    // Data inicial: menor entre data de início do projeto ou hoje
    const rangeStart = new Date(Math.min(new Date(projectStartDate).getTime(), today.getTime()))

    // Data final: fim do projeto + 7 dias
    const rangeEnd = addDays(maxDate, 7)

    const totalDays = differenceInDays(rangeEnd, rangeStart) + 1
    const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd })

    // Largura por dia
    const minDayWidth = 50
    const timelineWidth = totalDays * minDayWidth

    const getStagePosition = (startDate: Date, endDate: Date) => {
        const daysFromStart = differenceInDays(startDate, rangeStart)
        const duration = differenceInDays(endDate, startDate) + 1

        return {
            left: daysFromStart * minDayWidth,
            width: Math.max(duration * minDayWidth, 80) // Mínimo de 80px
        }
    }

    return (
        <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto border border-border rounded-lg bg-card"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div style={{ minWidth: `${timelineWidth + 300}px` }}>
                {/* Header */}
                <div className="grid grid-cols-[300px_1fr] bg-slate-700 dark:bg-slate-800 border-b border-border sticky top-0 z-10">
                    <div className="px-4 py-3 font-semibold text-sm text-slate-100 border-r border-slate-600">
                        Etapa
                    </div>
                    <div className="px-4 py-3 font-semibold text-sm text-slate-100">
                        Timeline
                    </div>
                </div>

                {/* Timeline Header */}
                <div className="grid grid-cols-[300px_1fr] bg-slate-200 dark:bg-slate-700 border-b border-border sticky top-[49px] z-10">
                    <div className="px-4 py-2 border-r border-slate-300 dark:border-slate-500" />
                    <div className="relative h-14 overflow-visible">
                        <div className="flex" style={{ width: `${timelineWidth}px` }}>
                            {allDays.map((day, index) => {
                                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                                const isToday = isSameDay(day, today)
                                const isFirstOfMonth = day.getDate() === 1

                                return (
                                    <div
                                        key={index}
                                        className={`text-center text-xs py-1 border-r border-slate-300/50 dark:border-slate-500/30 flex flex-col justify-center ${isWeekend ? 'bg-slate-300/40 dark:bg-slate-500/20' : ''
                                            } ${isToday ? 'bg-blue-200 dark:bg-blue-500/30' : ''}`}
                                        style={{ width: `${minDayWidth}px`, minWidth: `${minDayWidth}px` }}
                                    >
                                        {isFirstOfMonth && (
                                            <div className="font-bold text-slate-800 dark:text-slate-100 text-xs mb-1">
                                                {format(day, 'MMM', { locale: ptBR }).toUpperCase()}
                                            </div>
                                        )}
                                        <div className={`text-slate-700 dark:text-slate-200 text-xs ${isToday ? 'font-bold' : ''}`}>
                                            {format(day, 'dd')}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Body - Stages */}
                <div className="bg-white dark:bg-slate-900">
                    {stageTimeline.map((item, index) => {
                        const position = getStagePosition(item.startDate, item.endDate)

                        return (
                            <div
                                key={item.stage.id}
                                className="grid grid-cols-[300px_1fr] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                                {/* Stage Name */}
                                <div className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                    {item.stage.isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {format(item.startDate, 'dd/MM/yyyy')} - {format(item.endDate, 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="relative h-20 px-2 py-4 overflow-visible">
                                    {/* Grid Background */}
                                    <div className="absolute inset-0 flex" style={{ width: `${timelineWidth}px` }}>
                                        {allDays.map((day, dayIndex) => {
                                            const isWeekend = day.getDay() === 0 || day.getDay() === 6
                                            const isToday = isSameDay(day, today)

                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={`border-r border-slate-200/70 dark:border-slate-700/50 ${isWeekend ? 'bg-slate-100 dark:bg-slate-700/20' : ''}`}
                                                    style={{ width: `${minDayWidth}px`, minWidth: `${minDayWidth}px` }}
                                                >
                                                    {isToday && (
                                                        <div className="h-full w-[2px] bg-blue-500 mx-auto opacity-50" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Stage Bar */}
                                    <div
                                        className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-lg flex items-center px-4 text-sm font-medium shadow-lg transition-all ${item.stage.isCompleted
                                            ? 'bg-green-600 hover:bg-green-500 text-white'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                                            }`}
                                        style={{
                                            left: `${position.left}px`,
                                            width: `${position.width}px`,
                                        }}
                                        title={`${item.name}\n${format(item.startDate, 'dd/MM/yyyy')} - ${format(item.endDate, 'dd/MM/yyyy')}`}
                                    >
                                        <span className="truncate text-xs">
                                            {item.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
