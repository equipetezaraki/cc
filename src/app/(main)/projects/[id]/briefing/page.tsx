import { BriefingForm } from "./briefing-form"
import { getProjectDetails } from "../actions"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function BriefingPage({ params }: PageProps) {
    const { id } = await params
    const project = await getProjectDetails(id)

    if (!project) {
        notFound()
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Briefing do Projeto: {project.name}</h1>
                <p className="text-muted-foreground">Preencha as informações de contexto e desenhe os funis para o time de CRM e IA.</p>
            </div>

            <BriefingForm projectId={project.id} initialData={project.briefing} />
        </div>
    )
}
