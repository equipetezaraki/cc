import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarClock, CheckCircle2, Circle, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default async function ClientSchedulePage() {
    const session = await getSession()
    if (!session || session.user.role !== 'CLIENT') {
        redirect('/login')
    }

    const client = await prisma.client.findUnique({
        where: { email: session.user.email }
    })

    if (!client) {
        return <div className="p-8">Erro: Perfil de cliente não encontrado.</div>
    }

    const project = await prisma.project.findFirst({
        where: { clientId: client.id },
        include: {
            stages: {
                orderBy: { stageNumber: 'asc' }
            }
        }
    })

    if (!project) {
        return <div className="p-8">Nenhum projeto encontrado.</div>
    }

    // Check if project is scheduled (has meetingDate)
    if (!project.meetingDate) {
        return (
            <div className="p-8">
                <Card className="max-w-md mx-auto text-center">
                    <CardHeader>
                        <div className="mx-auto bg-muted p-4 rounded-full mb-4">
                            <CalendarClock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle>Cronograma Aguardando Definição</CardTitle>
                        <CardDescription>
                            O cronograma oficial do projeto será disponibilizado aqui assim que a reunião de alinhamento for agendada pelo Product Owner.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // Simplified stages to show
    // We can filter out internal stages or just show the main ones.
    // The user asked for "Cronograma Simplificado".
    // Let's show the main stages (1 to 7) with their dates.

    const stageNames = {
        1: "Onboarding",
        2: "Validação de Esboços",
        3: "Setup & Automações",
        4: "Desenvolvimento de Funis",
        5: "Go-Live",
        6: "Maturação",
        7: "Entrega Final"
    }

    // Group stages by number (handle multi-funnel stages in 4)
    const stagesByNumber = new Map<number, { start: Date | null, end: Date | null, status: string }>()

    for (const stage of project.stages) {
        if (!stagesByNumber.has(stage.stageNumber)) {
            stagesByNumber.set(stage.stageNumber, {
                start: stage.startDate,
                end: stage.endDate,
                status: stage.isCompleted ? 'COMPLETED' : 'PENDING' // Simplified status
            })
        } else {
            // Update range if needed
            const current = stagesByNumber.get(stage.stageNumber)!
            if (stage.startDate && current.start && stage.startDate < current.start) current.start = stage.startDate
            if (stage.endDate && current.end && stage.endDate > current.end) current.end = stage.endDate
            // If any substage is pending, the whole stage is pending? Or if all completed?
            // Let's assume if current stage number < project.currentStep, it's completed.
        }
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="p-6 border-b bg-background">
                <h1 className="text-2xl font-bold tracking-tight">Cronograma do Projeto</h1>
                <p className="text-muted-foreground">
                    Acompanhe as etapas e prazos do seu projeto.
                </p>
            </div>
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                        const stageData = stagesByNumber.get(num)
                        const isCompleted = project.currentStep > num
                        const isCurrent = project.currentStep === num
                        const isFuture = project.currentStep < num

                        if (!stageData) return null

                        return (
                            <div key={num} className="relative flex gap-6">
                                {/* Timeline Line */}
                                {num !== 7 && (
                                    <div className={cn(
                                        "absolute left-[19px] top-10 bottom-[-32px] w-0.5",
                                        isCompleted ? "bg-primary" : "bg-border"
                                    )} />
                                )}

                                {/* Status Icon */}
                                <div className="relative z-10">
                                    {isCompleted ? (
                                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                    ) : isCurrent ? (
                                        <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary shadow-sm">
                                            <Clock className="h-5 w-5 animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-muted border-2 border-muted-foreground/20 flex items-center justify-center text-muted-foreground">
                                            <Circle className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <Card className={cn(
                                    "flex-1 mb-2 transition-colors",
                                    isCurrent && "border-primary/50 bg-primary/5"
                                )}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className={cn(
                                                    "text-lg",
                                                    isFuture && "text-muted-foreground"
                                                )}>
                                                    Etapa {num}: {stageNames[num as keyof typeof stageNames]}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {stageData.start && stageData.end ? (
                                                        <>
                                                            {format(stageData.start, "dd 'de' MMMM", { locale: ptBR })}
                                                            {' - '}
                                                            {format(stageData.end, "dd 'de' MMMM", { locale: ptBR })}
                                                        </>
                                                    ) : (
                                                        "Datas a definir"
                                                    )}
                                                </CardDescription>
                                            </div>
                                            {isCurrent && (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    Em andamento
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
