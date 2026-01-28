'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateBusinessDate } from '@/lib/date-utils'

export async function toggleStage(stageId: string, checked: boolean, projectId: string) {
    try {
        // Get the stage being toggled
        const stage = await prisma.projectStage.findUnique({
            where: { id: stageId }
        })

        if (!stage) {
            return { error: "Etapa não encontrada" }
        }

        // If trying to mark as complete, check if all tasks for this stage are done
        if (checked && stage.endDate) {
            // Get all tasks with plannedEnd matching this stage's endDate
            const tasksForStage = await prisma.task.findMany({
                where: {
                    projectId,
                    plannedEnd: stage.endDate
                }
            })

            // Check if all tasks are completed
            const pendingTasks = tasksForStage.filter(task => !task.isCompleted)

            if (pendingTasks.length > 0) {
                return {
                    error: `Não é possível concluir esta etapa. Existem ${pendingTasks.length} tarefa(s) pendente(s) com prazo nesta data.`
                }
            }
        }

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

export async function updateStageDate(stageId: string, endDate: Date, projectId: string) {
    try {
        // Get the stage being updated
        const updatedStage = await prisma.projectStage.findUnique({
            where: { id: stageId }
        })

        if (!updatedStage) {
            return { error: "Stage not found" }
        }

        // Get project to access funnelCount
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { funnelCount: true }
        })

        if (!project) {
            return { error: "Project not found" }
        }

        // Get all stages for this project, ordered
        const allStages = await prisma.projectStage.findMany({
            where: { projectId },
            orderBy: [
                { stageNumber: 'asc' },
                { funnelNumber: 'asc' }
            ]
        })

        // Update the modified stage
        await prisma.projectStage.update({
            where: { id: stageId },
            data: { endDate }
        })

        // Recalculate subsequent stages
        const stagesToUpdate: Array<{ id: string, startDate: Date, endDate: Date }> = []
        let currentEndDate = endDate

        // Find the index of the updated stage
        const updatedIndex = allStages.findIndex(s => s.id === stageId)

        // Fetch templates for dynamic durations
        const templates = await prisma.stageTemplate.findMany()
        const templateMap = templates.reduce((acc, t) => {
            acc[t.stageNumber] = t
            return acc
        }, {} as Record<number, typeof templates[0]>)

        // Process all stages after the updated one
        for (let i = updatedIndex + 1; i < allStages.length; i++) {
            const stage = allStages[i]
            const template = templateMap[stage.stageNumber]
            if (!template) continue

            const newStartDate = currentEndDate
            let duration = template.durationDays

            // If it's maturação (usually stage 6), it's often calendar days
            let newEndDate: Date
            if (template.stageNumber === 6) {
                newEndDate = new Date(newStartDate)
                newEndDate.setDate(newEndDate.getDate() + 30)
            } else {
                if ((template as any).isPerFunnel) {
                    duration = duration * project.funnelCount
                }
                newEndDate = calculateBusinessDate(newStartDate, duration)
            }

            stagesToUpdate.push({
                id: stage.id,
                startDate: newStartDate,
                endDate: newEndDate
            })

            currentEndDate = newEndDate
        }

        // Batch update all affected stages
        for (const update of stagesToUpdate) {
            await prisma.projectStage.update({
                where: { id: update.id },
                data: {
                    startDate: update.startDate,
                    endDate: update.endDate
                }
            })
        }

        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/kanban')
        return { success: true }
    } catch (error) {
        console.error("Failed to update stage date:", error)
        return { error: "Failed to update date" }
    }
}
