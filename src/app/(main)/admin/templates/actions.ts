'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'

// --- Types ---
export type StageTemplateWithTasks = Awaited<ReturnType<typeof getTemplates>>[number]

// --- Fetch Actions ---

export async function getTemplates() {
    try {
        const templates = await prisma.stageTemplate.findMany({
            orderBy: { stageNumber: 'asc' },
            include: {
                tasks: {
                    orderBy: { createdAt: 'asc' } // Or another order if we add 'order' field to tasks later
                }
            }
        })
        return templates
    } catch (error) {
        console.error("Error fetching templates:", error)
        return []
    }
}

// --- Stage Actions ---

export async function updateStageTemplate(id: string, data: { name?: string, kanbanColumn?: string, durationDays?: number, trigger?: string }) {
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


// --- Task Actions ---

export async function createTaskTemplate(stageId: string, data: { title: string, description?: string, role: Role, durationDays?: number, trigger?: string }) {
    try {
        await prisma.taskTemplate.create({
            data: {
                ...data,
                stageTemplateId: stageId
            }
        })
        revalidatePath('/admin/templates')
        return { success: true }

    } catch (error) {
        console.error("Error creating task template:", error)
        return { error: "Erro ao criar tarefa modelo." }
    }
}

export async function updateTaskTemplate(id: string, data: { title?: string, description?: string, role?: Role, durationDays?: number, trigger?: string }) {
    try {
        await prisma.taskTemplate.update({
            where: { id },
            data
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
