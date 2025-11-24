'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Lock } from "lucide-react"
import { Task } from "@prisma/client"

interface ReadOnlyStageChecklistProps {
    currentStep: number
    tasks: Task[]
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

export function ReadOnlyStageChecklist({ currentStep, tasks }: ReadOnlyStageChecklistProps) {
    // Filter tasks for the current stage
    const currentStageTasks = tasks
        .filter(t => t.stageRef === currentStep)
        .sort((a, b) => {
            // Extrair números do título para ordenação numérica correta
            const extractNumber = (title: string) => {
                const match = title.match(/\d+/)
                return match ? parseInt(match[0]) : 0
            }

            const numA = extractNumber(a.title)
            const numB = extractNumber(b.title)

            // Se ambos têm números, ordenar numericamente
            if (numA && numB) {
                return numA - numB
            }

            // Caso contrário, ordenar alfabeticamente
            return a.title.localeCompare(b.title, 'pt-BR')
        })

    const stageName = STAGE_NAMES[currentStep] || `Etapa ${currentStep}`

    if (currentStep > 7) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Projeto Concluído
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-green-600">Todas as etapas foram finalizadas com sucesso.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                    <span>Etapa Atual: {stageName}</span>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {currentStageTasks.length === 0 && (
                        <p className="text-muted-foreground text-sm">Aguardando atualizações da equipe.</p>
                    )}
                    {currentStageTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                            {task.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={task.isCompleted ? "line-through text-muted-foreground" : ""}>
                                {task.title}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-center">
                    * Esta visualização é apenas para acompanhamento.
                </div>
            </CardContent>
        </Card>
    )
}
