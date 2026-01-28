'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'


export async function saveBriefing(projectId: string, data: any) {
    try {
        // 1. Update Client
        await prisma.client.update({
            where: { id: data.clientId },
            data: {
                name: data.clientName,
                company: data.companyName,
                email: data.email,
                phone: data.phone,
                segment: data.segment,
                operationSize: data.operationSize
            }
        })

        // 2. Update Project
        await prisma.project.update({
            where: { id: projectId },
            data: {
                name: data.projectName,
                funnelCount: data.funnelCount,
                projectType: data.projectType,
                technicalBriefingUrl: data.technicalBriefingUrl
            }
        })

        // 3. Update or Create Briefing
        const existingBriefing = await prisma.briefing.findUnique({
            where: { projectId }
        })

        if (existingBriefing) {
            await prisma.briefing.update({
                where: { projectId },
                data: {
                    flowchartData: data.flowchartData
                }
            })
        } else {
            await prisma.briefing.create({
                data: {
                    projectId,
                    flowchartData: data.flowchartData
                }
            })
        }

        // Mark the "Preencher Briefing" task as completed if it exists
        // We find it by title or role since we didn't store a specific ID link
        // Or we can just leave it to the user to toggle.
        // Let's try to find it by title for convenience.
        const briefingTask = await prisma.task.findFirst({
            where: {
                projectId,
                title: { contains: "Preencher Briefing" }
            }
        })

        if (briefingTask) {
            await prisma.task.update({
                where: { id: briefingTask.id },
                data: { isCompleted: true }
            })
        }

        revalidatePath(`/projects/${projectId}`)
    } catch (error) {
        console.error("Failed to save briefing:", error)
        return { error: "Failed to save briefing" }
    }

    // Redirect must be called outside try-catch
    // as it throws a special exception that Next.js needs to handle
    redirect(`/projects/${projectId}`)
}
