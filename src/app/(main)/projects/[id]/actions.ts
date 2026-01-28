'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'

export async function getProjectDetails(id: string) {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            client: true,
            tasks: {
                orderBy: {
                    plannedStart: 'asc'
                }
            },
            stages: {
                orderBy: [
                    { stageNumber: 'asc' },
                    { funnelNumber: 'asc' }
                ]
            },
            briefing: true
        }
    })

    if (!project) {
        notFound()
    }

    const templates = await prisma.stageTemplate.findMany({
        orderBy: { stageNumber: 'asc' }
    })

    return { ...project, templates }
}

export async function saveFaqLink(projectId: string, faqLink: string) {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { faqLink }
        })

        // Find and complete the FAQ task
        const faqTask = await prisma.task.findFirst({
            where: {
                projectId,
                title: "Anexar Link do FAQ do Cliente"
            }
        })

        if (faqTask && !faqTask.isCompleted) {
            await prisma.task.update({
                where: { id: faqTask.id },
                data: {
                    isCompleted: true,
                    actualEnd: new Date()
                }
            })
        }

        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/dashboard')
        revalidatePath('/deliveries')
        revalidatePath('/client/setup')

        return { success: true }
    } catch (error) {
        console.error("Error saving FAQ link:", error)
        return { error: "Erro ao salvar link do FAQ." }
    }
}
