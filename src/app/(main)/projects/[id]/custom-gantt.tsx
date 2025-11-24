'use client'

import { Task } from "@prisma/client"
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, Circle } from "lucide-react"
import { useRef, useState, useEffect } from "react"

interface CustomGanttProps {
    tasks: Task[]
}

export function CustomGantt({ tasks }: CustomGanttProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    // Handle mouse down - start dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
        setScrollLeft(scrollContainerRef.current.scrollLeft)
        scrollContainerRef.current.style.cursor = 'grabbing'
        scrollContainerRef.current.style.userSelect = 'none'
    }

    // Handle mouse move - drag
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollContainerRef.current.offsetLeft
        const walk = (x - startX) * 2 // Scroll speed multiplier
        scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }

    // Handle mouse up/leave - stop dragging
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

    if (tasks.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground border border-border rounded-lg bg-card">
                Nenhuma tarefa encontrada.
            </div>
        )
    }

    // Ordenar tarefas para exibição
    const sortedTasks = [...tasks].sort((a, b) => {
        // Primeiro ordenar por etapa (stageRef)
        if (a.stageRef !== b.stageRef) {
            return (a.stageRef || 0) - (b.stageRef || 0)
        }

        // Dentro da mesma etapa, ordenar por número do funil
        const extractNumber = (title: string): number => {
            const match = title.match(/(?:Funil|Etapa)\s*(\d+)/i)
            return match ? parseInt(match[1]) : 0
        }

        const numA = extractNumber(a.title)
        const numB = extractNumber(b.title)

        // Se ambos têm números (ex: Funil 1, Funil 2), ordenar numericamente
        if (numA && numB) {
            return numA - numB
        }

        // Se apenas um tem número, colocar o que tem número primeiro
        if (numA) return -1
        if (numB) return 1

        // Caso contrário, ordenar alfabeticamente
        return a.title.localeCompare(b.title, 'pt-BR')
    })

    // Calcular range de datas
    const allDates = sortedTasks.flatMap(t => [new Date(t.plannedStart), new Date(t.plannedEnd)])
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))

    // Expandir para incluir início e fim do mês
    const rangeStart = startOfMonth(minDate)
    const rangeEnd = endOfMonth(maxDate)

    const totalDays = differenceInDays(rangeEnd, rangeStart) + 1
    const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd })

    // Largura mínima por dia em pixels (aumentado para melhor legibilidade)
    const minDayWidth = 50 // pixels
    // Garantir que a timeline tenha largura suficiente para todas as datas + padding extra
    const timelineWidth = totalDays * minDayWidth

    // Calcular posição de cada tarefa
    const getTaskPosition = (task: Task) => {
        const taskStart = new Date(task.plannedStart)
        const taskEnd = new Date(task.plannedEnd)
        const daysFromStart = differenceInDays(taskStart, rangeStart)
        const taskDuration = differenceInDays(taskEnd, taskStart) + 1

        return {
            left: daysFromStart * minDayWidth,
            width: taskDuration * minDayWidth
        }
    }

    const today = new Date()

    return (
        <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto border border-border rounded-lg bg-card"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Container principal com scroll horizontal */}
            <div style={{ minWidth: `${timelineWidth + 300}px` }}>
                {/* Cabeçalho com títulos das colunas */}
                <div className="grid grid-cols-[300px_1fr] bg-slate-700 dark:bg-slate-800 border-b border-border sticky top-0 z-10">
                    <div className="px-4 py-3 font-semibold text-sm text-slate-100 border-r border-slate-600 dark:border-slate-600">
                        Tarefa
                    </div>
                    <div className="px-4 py-3 font-semibold text-sm text-slate-100">
                        Timeline
                    </div>
                </div>

                {/* Timeline Header - Meses e dias */}
                <div className="grid grid-cols-[300px_1fr] bg-slate-200 dark:bg-slate-700 border-b border-border sticky top-[49px] z-10">
                    <div className="px-4 py-2 border-r border-slate-300 dark:border-slate-500" />
                    <div className="relative h-14 overflow-visible">
                        {/* Grid de dias */}
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
                                        <div className={`text-slate-700 dark:text-slate-200 text-sm ${isToday ? 'font-bold' : ''}`}>
                                            {format(day, 'dd')}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                            {format(day, 'EEE', { locale: ptBR })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Corpo - Tasks */}
                <div className="bg-white dark:bg-slate-900">
                    {sortedTasks.map((task, taskIndex) => {
                        const position = getTaskPosition(task)

                        return (
                            <div
                                key={task.id}
                                className="grid grid-cols-[300px_1fr] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                            >
                                {/* Coluna Nome da Tarefa */}
                                <div className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                    {task.isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title={task.title}
                                        >
                                            {task.title}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {format(new Date(task.plannedStart), 'dd/MM/yyyy')} - {format(new Date(task.plannedEnd), 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                </div>

                                {/* Coluna Timeline */}
                                <div className="relative h-20 px-2 py-4 overflow-visible">
                                    {/* Grid vertical de fundo */}
                                    <div className="absolute inset-0 flex" style={{ width: `${timelineWidth}px` }}>
                                        {allDays.map((day, index) => {
                                            const isWeekend = day.getDay() === 0 || day.getDay() === 6
                                            const isToday = isSameDay(day, today)

                                            return (
                                                <div
                                                    key={index}
                                                    className={`border-r border-slate-200/70 dark:border-slate-700/50 ${isWeekend ? 'bg-slate-100 dark:bg-slate-700/20' : ''
                                                        }`}
                                                    style={{ width: `${minDayWidth}px`, minWidth: `${minDayWidth}px` }}
                                                >
                                                    {isToday && (
                                                        <div className="h-full w-[2px] bg-blue-500 mx-auto opacity-50" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Barra da tarefa */}
                                    <div
                                        className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-lg flex items-center px-4 text-sm font-medium shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${task.isCompleted
                                            ? 'bg-green-600 hover:bg-green-500 text-white'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                                            }`}
                                        style={{
                                            left: `${position.left}px`,
                                            width: `${position.width}px`,
                                            minWidth: '100px'
                                        }}
                                        title={`${task.title}\n${format(new Date(task.plannedStart), 'dd/MM/yyyy')} - ${format(new Date(task.plannedEnd), 'dd/MM/yyyy')}`}
                                    >
                                        <span className="truncate">
                                            {task.title}
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
