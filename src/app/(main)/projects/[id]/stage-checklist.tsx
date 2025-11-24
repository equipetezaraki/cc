'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, Circle } from "lucide-react"
import { useTransition } from "react"
import { advanceProjectStage, toggleStage } from "./stage-actions"
import { cn } from "@/lib/utils"

interface ProjectStage {
    id: string
    stageNumber: number
    funnelNumber: number | null
    isCompleted: boolean
}

interface StageChecklistProps {
    projectId: string
    currentStep: number
    stages: ProjectStage[]
}

const STAGE_NAMES = [
    "N/A",
    "1. Definição / Reunião",
    "2. Validação de Esboços",
    "3. Setup & Automações",
    "4. Desenvolvimento de Funis",
    "5. Go-Live",
    "6. Maturação",
    "7. Entrega Final"
]

export function StageChecklist({ projectId, currentStep, stages }: StageChecklistProps) {
    const [isPending, startTransition] = useTransition()

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
        startTransition(async () => {
            await toggleStage(stageId, checked, projectId)
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
                    {currentStep <= 7 && (
                        <Button onClick={handleAdvance} disabled={isPending} size="sm">
                            {isPending ? "..." : "Aprovar Etapa"}
                        </Button>
                    )}
                </CardTitle>
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
                                            <div key={stage.id} className="flex items-start gap-2">
                                                <Checkbox
                                                    id={`stage-${stageNum}-${stage.id}`}
                                                    checked={stage.isCompleted}
                                                    onCheckedChange={(checked) => handleToggle(stage.id, checked as boolean)}
                                                    disabled={isPending}
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
