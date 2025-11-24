'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { STANDARD_TASKS } from '@/lib/standard-tasks'
import { calculateBusinessDate } from '@/lib/date-utils'

export async function generateStandardTasks(projectId: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { tasks: true }
        })

        if (!project) return { error: "Project not found" }

        const existingTitles = new Set(project.tasks.map(t => t.title))
        const tasksToCreate = []

        // Base date for calculation (simplified: using project start date or now)
        const baseDate = project.startDate || new Date()

        for (const stdTask of STANDARD_TASKS) {
            // Check if task already exists (by title - simple check)
            // Ideally we'd have a better way to track standard tasks, but title is okay for now
            if (!existingTitles.has(stdTask.title)) {

                // Calculate dates (simplified logic)
                // In a real scenario, this would depend on the actual completion of previous stages
                // For now, we just set them relative to project start
                const plannedStart = calculateBusinessDate(baseDate, stdTask.stage * 5) // Rough estimate
                const plannedEnd = calculateBusinessDate(plannedStart, stdTask.relativeDays || 1)

                tasksToCreate.push({
                    title: stdTask.title,
                    description: stdTask.description,
                    plannedStart,
                    plannedEnd,
                    stageRef: stdTask.stage,
                    assignedRole: stdTask.role,
                    projectId: projectId,
                    isCompleted: false
                })
            }
        }

        if (tasksToCreate.length > 0) {
            await prisma.task.createMany({
                data: tasksToCreate
            })
        }

        revalidatePath('/deliveries')
        revalidatePath(`/projects/${projectId}`)
        return { success: true, count: tasksToCreate.length }

    } catch (error) {
        console.error("Failed to generate tasks:", error)
        return { error: "Failed to generate tasks" }
    }
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }

    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted }
        })
        revalidatePath('/deliveries')
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle task:", error)
        return { error: "Failed to update task" }
    }
}
