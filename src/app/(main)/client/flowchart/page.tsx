import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BriefingFlowchart } from "@/components/briefing/briefing-flowchart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default async function ClientFlowchartPage() {
    const session = await getSession()
    if (!session || session.user.role !== 'CLIENT') {
        redirect('/login')
    }

    // Find the Client record using the session user's email
    const client = await prisma.client.findUnique({
        where: { email: session.user.email }
    })

    if (!client) {
        return <div className="p-8">Erro: Perfil de cliente não encontrado.</div>
    }

    const project = await prisma.project.findFirst({
        where: { clientId: client.id },
        include: {
            briefing: true
        }
    })

    if (!project) {
        return (
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Nenhum projeto encontrado</CardTitle>
                        <CardDescription>Você ainda não possui um projeto ativo.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const isBriefingComplete = project.currentStep >= 2
    const flowchartData = project.briefing?.flowchartData as any

    if (!isBriefingComplete) {
        return (
            <div className="p-8">
                <Card className="max-w-md mx-auto text-center">
                    <CardHeader>
                        <div className="mx-auto bg-muted p-4 rounded-full mb-4">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle>Fluxograma em Elaboração</CardTitle>
                        <CardDescription>
                            O fluxograma do seu projeto estará disponível aqui assim que a etapa de onboarding for concluída e o briefing for validado.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="p-6 border-b bg-background">
                <h1 className="text-2xl font-bold tracking-tight">Fluxograma do Projeto</h1>
                <p className="text-muted-foreground">
                    Visualização do fluxo de atendimento da sua IA.
                </p>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-950/50">
                {project.briefing && flowchartData ? (
                    <BriefingFlowchart
                        initialNodes={flowchartData.nodes || []}
                        initialEdges={flowchartData.edges || []}
                        readOnly={true}
                    />
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        Nenhum dado de fluxograma encontrado.
                    </div>
                )}
            </div>
        </div>
    )
}
