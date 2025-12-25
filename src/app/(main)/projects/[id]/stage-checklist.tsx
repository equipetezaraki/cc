'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, Circle, Calendar } from "lucide-react"
import { useState, useTransition } from "react"
import { advanceProjectStage, toggleStage, updateStageDate } from "./stage-actions"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface ProjectStage {
    id: string
    stageNumber: number
    funnelNumber: number | null
    isCompleted: boolean
    startDate: Date | null
    endDate: Date | null
}

interface StageChecklistProps {
    projectId: string
    currentStep: number
    stages: ProjectStage[]
    userRole: string
}

const STAGE_NAMES = [
    "N/A",
    "1. Onboarding",
    "2. Validação de Esboços",
    "3. Setup & Automações",
    "4. Desenvolvimento de Funis",
    "5. Go-Live",
    "6. Maturação",
    "7. Entrega Final"
]

export function StageChecklist({ projectId, currentStep, stages, userRole }: StageChecklistProps) {
    const [isPending, startTransition] = useTransition()
    const [editingStageId, setEditingStageId] = useState<string | null>(null)

    const canEditDates = userRole === 'ADMIN' || userRole === 'PRODUCT_OWNER'

    function handleAdvance() {
        if (!confirm("Tem certeza que deseja aprovar esta etapa e avançar?")) return

        startTransition(async () => {
            const result = await advanceProjectStage(projectId, currentStep)
            if (result.error) {
                alert(result.error)
            }
        })
    }

    function handleToggle(stageId: string, checked: boolean) {
        // Stages are now auto-completed based on task completion
        // Checkbox is disabled to prevent manual toggling
        return
    }

    function handleDateUpdate(stageId: string, date: Date | undefined) {
        if (!date) return

        startTransition(async () => {
            await updateStageDate(stageId, date, projectId)
            setEditingStageId(null)
        })
    }

    // Group stages by stage number
    const stagesByNumber = stages.reduce((acc, stage) => {
        if (!acc[stage.stageNumber]) acc[stage.stageNumber] = []
        acc[stage.stageNumber].push(stage)
        return acc
    }, {} as Record<number, ProjectStage[]>)

    // Sort funnels within stage 4
    if (stagesByNumber[4]) {
        stagesByNumber[4].sort((a, b) =>
            (a.funnelNumber || 0) - (b.funnelNumber || 0)
        )
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center text-lg">
                    <span>Checklist do Projeto</span>
                </CardTitle>
                {/* Button removed as per request */}
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="px-6 pb-6">
                    <div className="space-y-4">
                        {STAGE_NAMES.slice(1).map((name, index) => {
                            const stageNum = index + 1

                            const stageItems = stagesByNumber[stageNum] || []
                            const isCurrent = stageNum === currentStep
                            const isPast = stageNum < currentStep

                            // Check if all items in this stage are completed
                            const allCompleted = stageItems.length > 0 && stageItems.every(s => s.isCompleted)

                            return (
                                <div key={stageNum} className={cn("border dark:border-border rounded-lg p-3", isCurrent ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" : "bg-white dark:bg-card")}>
                                    <div className="flex items-center gap-2 font-semibold mb-2 text-sm">
                                        {isPast || allCompleted ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                                            isCurrent ? <Circle className="h-4 w-4 text-blue-500 fill-blue-100" /> :
                                                <Circle className="h-4 w-4 text-muted-foreground" />}
                                        <span className={cn(isPast && "text-muted-foreground", isCurrent && "text-blue-700")}>{name}</span>
                                    </div>

                                    <div className="space-y-2 pl-6">
                                        {stageItems.length === 0 && (
                                            <p className="text-xs text-muted-foreground italic">Sem sub-etapas.</p>
                                        )}
                                        {stageItems.map(stage => (
                                            <div key={stage.id} className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2 flex-1">
                                                    <Checkbox
                                                        id={`stage-${stageNum}-${stage.id}`}
                                                        checked={stage.isCompleted}
                                                        onCheckedChange={(checked) => handleToggle(stage.id, checked as boolean)}
                                                        disabled={true}
                                                    />
                                                    <label
                                                        htmlFor={`stage-${stageNum}-${stage.id}`}
                                                        className={cn(
                                                            "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                                                            stage.isCompleted && "line-through text-muted-foreground"
                                                        )}
                                                    >
                                                        {stage.funnelNumber
                                                            ? `Funil ${stage.funnelNumber}`
                                                            : name
                                                        }
                                                    </label>
                                                </div>

                                                {/* Date Display/Editor */}
                                                {stage.endDate && (
                                                    <div className="flex items-center gap-1">
                                                        {canEditDates ? (
                                                            <Popover open={editingStageId === stage.id} onOpenChange={(open) => setEditingStageId(open ? stage.id : null)}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                                                        disabled={isPending}
                                                                    >
                                                                        <Calendar className="h-3 w-3 mr-1" />
                                                                        {format(new Date(stage.endDate), "dd/MM/yy", { locale: ptBR })}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="end">
                                                                    <CalendarComponent
                                                                        mode="single"
                                                                        selected={new Date(stage.endDate)}
                                                                        onSelect={(date) => handleDateUpdate(stage.id, date)}
                                                                        disabled={isPending}
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {format(new Date(stage.endDate), "dd/MM/yy", { locale: ptBR })}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
