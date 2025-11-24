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
    startDate: Date
    tasks: {
        plannedEnd: Date
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
            tasks: {
                select: {
                    plannedEnd: true,
                    stageRef: true,
                    isCompleted: true
                }
            }
        }
    })
    return projects
}

export async function updateProjectStatus(projectId: string, newStatus: string, newStep: number) {
    try {
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
