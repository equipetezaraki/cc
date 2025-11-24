'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'


export async function advanceStage(projectId: string, currentStep: number) {
    const nextStep = currentStep + 1

    // Determine status based on next step
    let status = 'ACTIVE'
    if (nextStep > 7) {
        status = 'DONE'
    }

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                currentStep: nextStep,
                status: status
            }
        })

        // Mark current stage tasks as completed
        await prisma.task.updateMany({
            where: {
                projectId: projectId,
                stageRef: currentStep
            },
            data: {
                isCompleted: true
            }
        })

        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/kanban')
        return { success: true }
    } catch (error) {
        console.error("Failed to advance stage:", error)
        return { error: "Failed to advance stage" }
    }
}

export async function toggleTask(taskId: string, isCompleted: boolean, projectId: string) {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted }
        })
        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle task:", error)
        return { error: "Failed to toggle task" }
    }
}

export async function archiveProject(projectId: string) {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'ARCHIVED' }
        })
        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/kanban')
        revalidatePath('/archive')
        return { success: true }
    } catch (error) {
        console.error("Failed to archive project:", error)
        return { error: "Failed to archive project" }
    }
}
