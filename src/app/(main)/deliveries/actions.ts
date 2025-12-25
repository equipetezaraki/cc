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
            include: {
                tasks: true,
                stages: {
                    orderBy: [
                        { stageNumber: 'asc' },
                        { funnelNumber: 'asc' }
                    ]
                }
            }
        })

        if (!project) return { error: "Project not found" }

        const existingTitles = new Set(project.tasks.map(t => t.title))
        const tasksToCreate = []

        // Group stages by stageNumber
        const stagesByNumber = new Map<number, typeof project.stages>()
        for (const stage of project.stages) {
            if (!stagesByNumber.has(stage.stageNumber)) {
                stagesByNumber.set(stage.stageNumber, [])
            }
            stagesByNumber.get(stage.stageNumber)?.push(stage)
        }

        for (const stdTask of STANDARD_TASKS) {
            const projectStages = stagesByNumber.get(stdTask.stage) || []

            // Calculate summary dates for the whole stage (min start, max end)
            let summaryStart = null
            let summaryEnd = null

            if (projectStages.length > 0) {
                summaryStart = projectStages[0].startDate
                summaryEnd = projectStages[0].endDate

                for (const s of projectStages) {
                    if (s.startDate && summaryStart && s.startDate < summaryStart) summaryStart = s.startDate
                    if (s.endDate && summaryEnd && s.endDate > summaryEnd) summaryEnd = s.endDate
                }
            }

            // Fallbacks
            const baseDate = summaryStart || project.startDate
            const stageEnd = summaryEnd || project.startDate

            if (stdTask.perFunnel) {
                // Create a task for EACH funnel stage found
                for (const stage of projectStages) {
                    const titleSuffix = stage.funnelNumber ? ` (Funil ${stage.funnelNumber})` : ''
                    const fullTitle = `${stdTask.title}${titleSuffix}`

                    if (!existingTitles.has(fullTitle)) {
                        const sStart = stage.startDate || baseDate
                        const sEnd = stage.endDate || stageEnd

                        const plannedStart = sStart
                        const plannedEnd = stdTask.relativeDays > 0
                            ? calculateBusinessDate(sStart, stdTask.relativeDays)
                            : sEnd

                        tasksToCreate.push({
                            title: fullTitle,
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
            } else {
                // Standard single task for the stage
                if (!existingTitles.has(stdTask.title)) {
                    const plannedStart = baseDate
                    const plannedEnd = stdTask.relativeDays > 0
                        ? calculateBusinessDate(baseDate, stdTask.relativeDays)
                        : stageEnd

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
        // Get the task to check if it's the scheduling task
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    select: {
                        id: true,
                        meetingDate: true
                    }
                }
            }
        })

        if (!task) return { error: "Task not found" }

        // If trying to complete the scheduling task, verify meeting date is set
        if (isCompleted && task.title === "Agendar Apresentação de Esboços" && !task.project.meetingDate) {
            return { error: "A data da apresentação deve ser agendada antes de marcar esta tarefa como concluída." }
        }

        // Update the task
        await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted }
        })

        // Auto-complete/uncomplete stages based on task completion
        // Get all stages and tasks for this project
        const projectData = await prisma.project.findUnique({
            where: { id: task.projectId },
            include: {
                stages: true,
                tasks: true
            }
        })

        if (projectData) {
            // Find stages that have the same endDate as this task's plannedEnd
            const matchingStages = projectData.stages.filter(stage =>
                stage.endDate && task.plannedEnd &&
                stage.endDate.getTime() === task.plannedEnd.getTime()
            )

            // For each matching stage, check if all tasks are complete
            for (const stage of matchingStages) {
                const tasksForStage = projectData.tasks.filter(t =>
                    t.plannedEnd.getTime() === stage.endDate!.getTime()
                )

                const allTasksComplete = tasksForStage.every(t => t.isCompleted)

                // Update stage completion status
                await prisma.projectStage.update({
                    where: { id: stage.id },
                    data: {
                        isCompleted: allTasksComplete,
                        completedAt: allTasksComplete ? new Date() : null
                    }
                })
            }

            // Auto-advance project to next stage if all stages of current step are complete
            if (isCompleted) { // Only advance when completing a task, not when uncompleting
                const currentStep = projectData.currentStep

                // Get all stages for the current step
                const currentStepStages = projectData.stages.filter(s => s.stageNumber === currentStep)

                // Check if all stages of current step are now complete
                const allCurrentStepStagesComplete = currentStepStages.length > 0 &&
                    currentStepStages.every(s => {
                        // Check if this stage was just updated
                        const updatedStage = matchingStages.find(ms => ms.id === s.id)
                        if (updatedStage) {
                            // Use the newly calculated completion status
                            const tasksForThisStage = projectData.tasks.filter(t =>
                                t.plannedEnd.getTime() === s.endDate!.getTime()
                            )
                            return tasksForThisStage.every(t => t.isCompleted)
                        }
                        return s.isCompleted
                    })

                // If all stages of current step are complete, advance to next step
                if (allCurrentStepStagesComplete && currentStep < 7) {
                    await prisma.project.update({
                        where: { id: task.projectId },
                        data: {
                            currentStep: currentStep + 1,
                            status: currentStep + 1 > 7 ? 'DONE' : 'ACTIVE'
                        }
                    })
                    revalidatePath('/kanban')
                }
            }
        }

        revalidatePath('/deliveries')
        revalidatePath(`/projects/${task.projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle task:", error)
        return { error: "Failed to update task" }
    }
}
