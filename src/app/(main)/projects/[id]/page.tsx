import { getProjectDetails } from "./actions"
import { StageGantt } from "./stage-gantt"
import { StageChecklist } from "./stage-checklist"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ArchiveButton } from "./archive-button"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProjectDetailsPage({ params }: PageProps) {
    const { id } = await params
    const project = await getProjectDetails(id)

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/kanban">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-muted-foreground">{project.client.name} • {project.client.company || "Sem empresa"}</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Badge variant={project.status === 'DONE' ? 'default' : project.status === 'ARCHIVED' ? 'outline' : 'secondary'}>
                        {project.status}
                    </Badge>
                    {project.status !== 'ARCHIVED' && (
                        <ArchiveButton projectId={project.id} />
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Início do Projeto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{format(project.startDate, "dd/MM/yyyy")}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Funis Contratados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{project.funnelCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Links Rápidos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {project.requirementsLink && (
                            <a href={project.requirementsLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> Requisitos
                            </a>
                        )}
                        {project.credentialsLink && (
                            <a href={project.credentialsLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> Credenciais
                            </a>
                        )}
                        {!project.requirementsLink && !project.credentialsLink && (
                            <span className="text-sm text-muted-foreground">Nenhum link cadastrado</span>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Checklist & Gantt Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold">Cronograma (Gantt)</h2>
                    <StageGantt
                        stages={project.stages}
                        projectStartDate={project.startDate}
                        funnelCount={project.funnelCount}
                    />
                </div>
                <div className="space-y-4">
                    <StageChecklist
                        projectId={project.id}
                        currentStep={project.currentStep}
                        stages={project.stages}
                    />
                </div>
            </div>
        </div>
    )
}
