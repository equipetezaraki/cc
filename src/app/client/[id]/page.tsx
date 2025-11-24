import { getProjectDetails } from "@/app/(main)/projects/[id]/actions"
import { GanttChart } from "@/app/(main)/projects/[id]/gantt-chart"
import { ReadOnlyStageChecklist } from "../read-only-checklist"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { format } from "date-fns"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ClientDashboardPage({ params }: PageProps) {
    const { id } = await params
    const project = await getProjectDetails(id)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        T
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Tezaraki OS <span className="font-normal text-muted-foreground">| Área do Cliente</span></h1>
                </div>
                <Badge variant={project.status === 'DONE' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                    {project.status === 'DONE' ? 'Concluído' : 'Em Andamento'}
                </Badge>
            </header>

            <main className="container mx-auto py-8 px-4 space-y-8">
                {/* Welcome / Status */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-2xl font-bold mb-2">Olá, {project.client.name} 👋</h2>
                    <p className="text-muted-foreground">
                        Acompanhe aqui o progresso do seu projeto <strong>{project.name}</strong>.
                    </p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Data de Início</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{format(project.startDate, "dd/MM/yyyy")}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Previsão de Entrega</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Calculate final delivery date based on tasks */}
                            <div className="text-2xl font-bold">
                                {project.tasks.length > 0
                                    ? format(project.tasks[project.tasks.length - 1].plannedEnd, "dd/MM/yyyy")
                                    : "A definir"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Links do Projeto</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {project.requirementsLink && (
                                <a href={project.requirementsLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" /> Requisitos Enviados
                                </a>
                            )}
                            {project.credentialsLink && (
                                <a href={project.credentialsLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" /> Credenciais Enviadas
                                </a>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Cronograma de Execução
                        </h3>
                        <GanttChart tasks={project.tasks} />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Status Atual</h3>
                        <ReadOnlyStageChecklist
                            currentStep={project.currentStep}
                            tasks={project.tasks}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
