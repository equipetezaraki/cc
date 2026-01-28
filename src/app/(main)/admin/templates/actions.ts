'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Role, Prisma } from '@prisma/client'

// --- Types ---
export type StageTemplateWithTasks = {
    id: string
    name: string
    stageNumber: number
    kanbanColumn: string | null
    durationDays: number
    isPerFunnel: boolean
    createdAt: Date
    updatedAt: Date
    tasks: any[]
}

// --- Fetch Actions ---

export async function getTemplates(): Promise<StageTemplateWithTasks[]> {
    try {
        const templates = await prisma.stageTemplate.findMany({
            orderBy: { stageNumber: 'asc' },
            include: {
                tasks: {
                    orderBy: { order: 'asc' } as any
                }
            }
        })
        return templates as any
    } catch (error) {
        console.error("Error fetching templates:", error)
        return []
    }
}

// --- Stage Actions ---

export async function updateStageTemplate(id: string, data: { name?: string, kanbanColumn?: string, durationDays?: number, isPerFunnel?: boolean }) {
    try {
        await prisma.stageTemplate.update({
            where: { id },
            data
        })
        revalidatePath('/admin/templates')
        return { success: true }
    } catch (error) {
        console.error("Error updating stage template:", error)
        return { error: "Erro ao atualizar etapa." }
    }
}

export async function createStageTemplate(data: { name: string, stageNumber: number }) {
    try {
        await prisma.stageTemplate.create({
            data
        })
        revalidatePath('/admin/templates')
        return { success: true }
    } catch (error) {
        console.error("Error creating stage template:", error)
        return { error: "Erro ao criar etapa." }
    }
}

export async function deleteStageTemplate(id: string) {
    try {
        await prisma.stageTemplate.delete({
            where: { id }
        })
        revalidatePath('/admin/templates')
        return { success: true }
    } catch (error) {
        console.error("Error deleting stage template:", error)
        return { error: "Erro ao deletar etapa." }
    }
}

export async function reorderStages(data: { id: string, stageNumber: number }[]) {
    try {
        await prisma.$transaction(async (tx) => {
            // First, move all to a neutral zone to avoid unique constraint violations
            for (const item of data) {
                await tx.stageTemplate.update({
                    where: { id: item.id },
                    data: { stageNumber: item.stageNumber + 1000 }
                })
            }
            // Then move to final positions
            for (const item of data) {
                await tx.stageTemplate.update({
                    where: { id: item.id },
                    data: { stageNumber: item.stageNumber }
                })
            }
        })
        revalidatePath('/admin/templates')
        return { success: true }
    } catch (error) {
        console.error("Error reordering stages:", error)
        return { error: "Erro ao reordenar etapas." }
    }
}


// --- Task Actions ---

export async function createTaskTemplate(stageId: string, data: { title: string, description?: string, role: Role, durationDays?: number }) {
    try {
        // Get the last task order
        const lastTask = await prisma.taskTemplate.findFirst({
            where: { stageTemplateId: stageId },
            orderBy: { order: 'desc' } as any
        }) as any

        const nextOrder = lastTask ? (lastTask.order as number) + 1 : 0

        await prisma.taskTemplate.create({
            data: {
                ...data,
                stageTemplateId: stageId,
                order: nextOrder
            } as any
        })
        revalidatePath('/admin/templates')
        return { success: true }

    } catch (error) {
        console.error("Error creating task template:", error)
        return { error: "Erro ao criar tarefa modelo." }
    }
}

export async function updateTaskTemplate(id: string, data: { title?: string, description?: string, role?: Role, durationDays?: number }) {
    try {
        await prisma.taskTemplate.update({
            where: { id },
            data: data as any
        })
        revalidatePath('/admin/templates')
        return { success: true }
    } catch (error) {
        console.error("Error updating task template:", error)
        return { error: "Erro ao atualizar tarefa modelo." }
    }
}

export async function deleteTaskTemplate(id: string) {
    try {
        await prisma.taskTemplate.delete({
            where: { id }
        })
        revalidatePath('/admin/templates')
        return { success: true }
    } catch (error) {
        console.error("Error deleting task template:", error)
        return { error: "Erro ao deletar tarefa modelo." }
    }
}

export async function reorderTasks(data: { id: string, order: number }[]) {
    try {
        await prisma.$transaction(
            data.map(item =>
                prisma.taskTemplate.update({
                    where: { id: item.id },
                    data: { order: item.order } as any
                })
            )
        )
        revalidatePath('/admin/templates')
        return { success: true }
    } catch (error) {
        console.error("Error reordering tasks:", error)
        return { error: "Erro ao reordenar tarefas." }
    }
}
