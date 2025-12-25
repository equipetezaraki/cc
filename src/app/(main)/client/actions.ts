'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateBusinessDate } from '@/lib/date-utils'

const clientOnboardingSchema = z.object({
    openAiKey: z.string().optional(),
    openRouterKey: z.string().optional(),
    faqConfirmed: z.boolean().optional(),
})

export async function saveClientOnboardingData(projectId: string, data: z.infer<typeof clientOnboardingSchema>) {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                openAiKey: data.openAiKey,
                openRouterKey: data.openRouterKey,
                faqConfirmed: data.faqConfirmed,
            }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Error saving client onboarding data:", error)
        return { error: "Erro ao salvar dados." }
    }
}

export async function submitClientOnboarding(projectId: string, data: { openAiKey: string, openRouterKey: string, faqConfirmed: boolean }) {
    try {
        if (!data.openAiKey || !data.openRouterKey || !data.faqConfirmed) {
            return { error: "Preencha todos os campos obrigatórios." }
        }

        // 1. Update Project
        const project = await prisma.project.update({
            where: { id: projectId },
            data: {
                openAiKey: data.openAiKey,
                openRouterKey: data.openRouterKey,
                faqConfirmed: data.faqConfirmed,
                // Status remains ONBOARDING until PO schedules the meeting
            }
        })

        // 1.2 Check if speaking style is confirmed
        if (!project.speakingStyleConfirmed) {
            return { error: "Aguarde a definição do estilo de fala com a IA no WhatsApp." }
        }

        // 1.5 Check if task already exists to prevent duplicates
        const existingTask = await prisma.task.findFirst({
            where: {
                projectId: projectId,
                title: "Agendar Apresentação de Esboços"
            }
        })

        if (existingTask) {
            return { success: true, message: "Dados atualizados. Aguardando agendamento." }
        }

        // 2. Create Task for Product Owner
        // "Automaticamente deve abrir uma tarefa para a função PRODUCT_OWNER agendar reunião para apresentação dos esboços."
        await prisma.task.create({
            data: {
                title: "Agendar Apresentação de Esboços",
                description: "O cliente preencheu os dados iniciais (API Keys). Agende a reunião de apresentação para gerar o cronograma do projeto.",
                plannedStart: new Date(),
                plannedEnd: calculateBusinessDate(new Date(), 2), // 2 days SLA?
                assignedRole: 'PRODUCT_OWNER',
                projectId: projectId,
                isCompleted: false
            }
        })

        revalidatePath('/dashboard')
        return { success: true }

    } catch (error) {
        console.error("Error submitting client onboarding:", error)
        return { error: "Erro ao enviar dados." }
    }
}
