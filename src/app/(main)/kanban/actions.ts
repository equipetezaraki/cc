'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'


export type KanbanProject = {
    id: string
    name: string
    client: {
        name: string
    }
    status: string
    currentStep: number
    startDate: string
    meetingDate: string | null
    stages?: {
        stageNumber: number
        funnelNumber: number | null
        endDate: string | null
    }[]
    tasks: {
        plannedEnd: string
        stageRef: number | null
        isCompleted: boolean
    }[]
}

export async function getProjects(): Promise<KanbanProject[]> {
    const projects = await prisma.project.findMany({
        where: {
            status: {
                not: 'ARCHIVED'
            }
        },
        include: {
            client: {
                select: { name: true }
            },
            stages: {
                select: {
                    stageNumber: true,
                    funnelNumber: true,
                    endDate: true
                },
                orderBy: [
                    { stageNumber: 'asc' },
                    { funnelNumber: 'asc' }
                ]
            },
            tasks: {
                select: {
                    plannedEnd: true,
                    stageRef: true,
                    isCompleted: true
                }
            }
        }
    })

    // Serialize dates to ISO strings for client-side hydration
    return projects.map(project => ({
        ...project,
        startDate: project.startDate.toISOString(),
        meetingDate: project.meetingDate ? project.meetingDate.toISOString() : null,
        stages: project.stages?.map(stage => ({
            ...stage,
            endDate: stage.endDate ? stage.endDate.toISOString() : null
        })),
        tasks: project.tasks.map(task => ({
            ...task,
            plannedEnd: task.plannedEnd.toISOString()
        }))
    }))
}

export async function updateProjectStatus(projectId: string, newStatus: string, newStep: number) {
    try {
        // Get current project to check current step
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                stages: {
                    where: {
                        stageNumber: { lte: newStep }
                    },
                    select: {
                        stageNumber: true,
                        endDate: true
                    }
                },
                tasks: {
                    select: {
                        plannedEnd: true,
                        isCompleted: true
                    }
                }
            }
        })

        if (!project) {
            return { error: "Projeto não encontrado" }
        }

        // Only validate if moving forward (not backwards to onboarding)
        if (newStep > project.currentStep) {
            // Get the stage(s) for the current step
            const currentStages = project.stages.filter(s => s.stageNumber === project.currentStep)

            // Check if there are pending tasks for any of the current stage dates
            for (const stage of currentStages) {
                if (stage.endDate) {
                    const tasksForStage = project.tasks.filter(task =>
                        task.plannedEnd.getTime() === stage.endDate!.getTime()
                    )

                    const pendingTasks = tasksForStage.filter(task => !task.isCompleted)

                    if (pendingTasks.length > 0) {
                        return {
                            error: `Não é possível avançar. Existem ${pendingTasks.length} tarefa(s) pendente(s) na etapa atual.`
                        }
                    }
                }
            }
        }

        await prisma.project.update({
            where: { id: projectId },
            data: {
                status: newStatus,
                currentStep: newStep
            }
        })
        revalidatePath('/kanban')
        return { success: true }
    } catch (error) {
        console.error("Failed to update project:", error)
        return { error: "Failed to update project status" }
    }
}
