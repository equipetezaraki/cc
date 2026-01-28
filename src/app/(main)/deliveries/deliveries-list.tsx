'use client'

import { useState, useTransition } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isToday, isTomorrow, isYesterday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toggleTaskCompletion } from "./actions"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, LayoutList, ExternalLink } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TaskWithProject {
    id: string
    title: string
    description: string | null
    plannedStart: Date
    plannedEnd: Date
    isCompleted: boolean
    assignedRole: string | null
    projectId: string
    project: {
        name: string
        stages: {
            stageNumber: number
            funnelNumber: number | null
            endDate: Date | null
        }[]
    }
}

const STAGE_NAMES: Record<number, string> = {
    1: "Onboarding",
    2: "Validação",
    3: "Setup",
    4: "Desenv. Funis",
    5: "Go-Live",
    6: "Maturação",
    7: "Entrega Final"
}

function getTaskStageInfo(task: TaskWithProject) {
    const matchingStage = task.project.stages.find(stage =>
        stage.endDate && task.plannedEnd &&
        new Date(stage.endDate).getTime() === new Date(task.plannedEnd).getTime()
    )

    if (!matchingStage) return null

    return {
        stageNumber: matchingStage.stageNumber,
        stageName: STAGE_NAMES[matchingStage.stageNumber] || `Etapa ${matchingStage.stageNumber}`,
        funnelNumber: matchingStage.funnelNumber
    }
}

export function DeliveriesList({ tasks, userRole }: { tasks: TaskWithProject[], userRole: string }) {
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING')
    const [filterRole, setFilterRole] = useState<string>('ALL')
    const [viewMode, setViewMode] = useState<'PROJECT' | 'DATE'>('PROJECT')
    const [searchTerm, setSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleToggle = (taskId: string, currentStatus: boolean) => {
        startTransition(async () => {
            const result = await toggleTaskCompletion(taskId, !currentStatus)
            if (result?.error) {
                toast.error(result.error)
            }
        })
    }

    // Extract unique roles from tasks
    const uniqueRoles = Array.from(new Set(tasks.map(t => t.assignedRole).filter(Boolean))) as string[]

    const filteredTasks = tasks.filter(task => {
        const matchesStatus =
            filterStatus === 'ALL' ? true :
                filterStatus === 'PENDING' ? !task.isCompleted :
                    task.isCompleted

        const matchesRole =
            filterRole === 'ALL' ? true :
                task.assignedRole === filterRole

        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.project.name.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesStatus && matchesSearch && matchesRole
    })

    // Grouping Logic
    const groupedTasks = filteredTasks.reduce((acc, task) => {
        let key = ""

        if (viewMode === 'PROJECT') {
            key = task.project.name
        } else {
            const date = new Date(task.plannedEnd)
            if (isToday(date)) key = "Hoje"
            else if (isTomorrow(date)) key = "Amanhã"
            else if (isYesterday(date)) key = "Ontem"
            else key = format(date, "dd 'de' MMMM", { locale: ptBR })
        }

        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(task)
        return acc
    }, {} as Record<string, TaskWithProject[]>)

    // Sort keys
    // Sort keys
    const sortedKeys = Object.keys(groupedTasks).sort((a, b) => {
        if (viewMode === 'PROJECT') return a.localeCompare(b)

        // Sort by date (ascending)
        const taskA = groupedTasks[a][0]
        const taskB = groupedTasks[b][0]

        if (!taskA || !taskB) return 0

        return new Date(taskA.plannedEnd).getTime() - new Date(taskB.plannedEnd).getTime()
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1 items-center">
                    <Input
                        placeholder="Buscar por tarefa ou projeto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:max-w-sm bg-background"
                    />
                    <div className="flex gap-2 w-full md:w-auto">
                        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                            <SelectTrigger className="w-full md:w-[180px] bg-background">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pendentes</SelectItem>
                                <SelectItem value="COMPLETED">Concluídas</SelectItem>
                                <SelectItem value="ALL">Todas</SelectItem>
                            </SelectContent>
                        </Select>

                        {userRole === 'ADMIN' && (
                            <Select value={filterRole} onValueChange={setFilterRole}>
                                <SelectTrigger className="w-full md:w-[180px] bg-background">
                                    <SelectValue placeholder="Função" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todas as Funções</SelectItem>
                                    {uniqueRoles.map(role => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full md:w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="PROJECT">
                            <LayoutList className="mr-2 h-4 w-4" />
                            Por Projeto
                        </TabsTrigger>
                        <TabsTrigger value="DATE">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Por Data
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {sortedKeys.map((groupKey) => (
                <Card key={groupKey} className="bg-card border-border">
                    <CardHeader className="pb-3 bg-muted/30 border-b">
                        <CardTitle className="text-lg font-semibold flex items-center justify-between text-foreground">
                            <div className="flex items-center gap-2">
                                {groupKey}
                                {viewMode === 'PROJECT' && groupedTasks[groupKey][0] && (
                                    <Link href={`/projects/${groupedTasks[groupKey][0].projectId}`}>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <Badge variant="outline" className="bg-background">{groupedTasks[groupKey].length} tarefas</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-3">
                            {groupedTasks[groupKey].map(task => (
                                <div key={task.id} className="flex items-start space-x-4 p-4 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors">
                                    <Checkbox
                                        checked={task.isCompleted}
                                        onCheckedChange={() => handleToggle(task.id, task.isCompleted)}
                                        disabled={isPending}
                                        className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={cn("font-medium leading-none text-foreground", task.isCompleted && "line-through text-muted-foreground")}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {(() => {
                                                    const stageInfo = getTaskStageInfo(task)
                                                    return stageInfo && (
                                                        <Badge variant="default" className="text-xs font-normal bg-blue-600 hover:bg-blue-700">
                                                            {stageInfo.funnelNumber
                                                                ? `${stageInfo.stageName} - F${stageInfo.funnelNumber}`
                                                                : `Etapa ${stageInfo.stageNumber}: ${stageInfo.stageName}`
                                                            }
                                                        </Badge>
                                                    )
                                                })()}
                                                {userRole === 'ADMIN' && (
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {task.assignedRole}
                                                    </Badge>
                                                )}
                                                {viewMode === 'DATE' && (
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {task.project.name}
                                                    </Badge>
                                                )}
                                                <span className={cn("text-sm font-medium",
                                                    task.plannedEnd < new Date() && !task.isCompleted ? "text-destructive" : "text-muted-foreground"
                                                )}>
                                                    {format(new Date(task.plannedEnd), "dd/MM", { locale: ptBR })}
                                                </span>
                                            </div>
                                        </div>
                                        {task.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {task.description}
                                            </p>
                                        )}
                                        {task.title.includes("Briefing") && (
                                            <a
                                                href={`/projects/${task.projectId}/briefing`}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors mt-2"
                                            >
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Abrir Briefing
                                            </a>
                                        )}
                                        {task.title === "Anexar Link do FAQ do Cliente" && !task.isCompleted && (
                                            <a
                                                href={`/projects/${task.projectId}`}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors mt-2"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Ir para o Projeto
                                            </a>
                                        )}
                                        {(task.title === "Agendar Apresentação de Esboços" || task.title === "Iniciar onboarding com cliente" || task.title === "Agendar Onboarding") && !task.isCompleted && (
                                            <div className="mt-2">
                                                <ScheduleMeetingDialog taskId={task.id} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {filteredTasks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    Nenhuma tarefa encontrada com os filtros atuais.
                </div>
            )}
        </div>
    )
}

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { scheduleProjectMeeting } from "@/app/(main)/project/actions"
import { toast } from "sonner"

function ScheduleMeetingDialog({ taskId }: { taskId: string }) {
    const [date, setDate] = useState<Date>()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSchedule = () => {
        if (!date) return
        startTransition(async () => {
            const result = await scheduleProjectMeeting(taskId, date)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Reunião agendada e cronograma gerado!")
                setOpen(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Agendar Reunião
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Agendar Apresentação</DialogTitle>
                    <DialogDescription>
                        Selecione a data da reunião. Isso irá gerar o cronograma do projeto.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <DialogFooter>
                    <Button onClick={handleSchedule} disabled={!date || isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Agendamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
