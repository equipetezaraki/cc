'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleStage(stageId: string, checked: boolean, projectId: string) {
    try {
        await prisma.projectStage.update({
            where: { id: stageId },
            data: {
                isCompleted: checked,
                completedAt: checked ? new Date() : null
            }
        })
        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle stage:", error)
        return { error: "Failed to update stage" }
    }
}

export async function advanceProjectStage(projectId: string, currentStep: number) {
    try {
        // Verificar se todas as etapas da stage atual estão completas
        const currentStages = await prisma.projectStage.findMany({
            where: {
                projectId,
                stageNumber: currentStep
            }
        })

        const allCompleted = currentStages.every(stage => stage.isCompleted)

        if (!allCompleted) {
            return { error: "Todas as sub-etapas devem estar completas antes de avançar" }
        }

        // Avançar para a próxima etapa
        await prisma.project.update({
            where: { id: projectId },
            data: { currentStep: currentStep + 1 }
        })

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to advance stage:", error)
        return { error: "Failed to advance stage" }
    }
}
