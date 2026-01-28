import { getClientProject } from "@/app/(main)/dashboard/actions"
import { ClientOnboarding } from "@/components/client-onboarding"
import { AlertCircle, ExternalLink } from "lucide-react"
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClientSetupPage() {
    const project = await getClientProject()

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold">Nenhum projeto encontrado</h2>
                <p>Entre em contato com o suporte.</p>
            </div>
        )
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configurações da IA</h1>
                    <p className="text-muted-foreground">
                        Configure as chaves de API e informações para o funcionamento da sua IA.
                    </p>
                </div>
            </div>
            <ClientOnboarding
                projectId={project.id}
                faqLink={project.faqLink || project.googleSheetUrl || project.technicalBriefingUrl}
                initialData={{
                    openAiKey: project.openAiKey,
                    openRouterKey: project.openRouterKey,
                    faqConfirmed: project.faqConfirmed,
                    speakingStyleConfirmed: project.speakingStyleConfirmed,
                }}
                hasPendingOnboardingTask={project.hasPendingOnboardingTask}
            />
        </div>
    )
}
