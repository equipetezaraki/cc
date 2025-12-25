'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { FeedbackStatus } from "@prisma/client"

export async function createFeedback(formData: { content: string, location: string }) {
    const session = await getSession()
    if (!session || session.user.role !== 'CLIENT') {
        throw new Error("Unauthorized")
    }

    const client = await prisma.client.findUnique({
        where: { email: session.user.email }
    })

    if (!client) {
        throw new Error("Client not found")
    }

    const { content, location } = formData

    await prisma.feedback.create({
        data: {
            clientId: client.id,
            content,
            location,
            status: 'PENDING'
        }
    })

    revalidatePath('/client/feedbacks')
    revalidatePath('/feedbacks')
}

export async function updateFeedbackStatus(
    feedbackId: string,
    status: FeedbackStatus,
    conclusionComment?: string
) {
    const session = await getSession()
    const allowedRoles = ['ADMIN', 'IA', 'PRODUCT_OWNER', 'CRM']

    if (!session || !allowedRoles.includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
            status,
            conclusionComment,
            updatedAt: new Date()
        }
    })

    revalidatePath('/client/feedbacks')
    revalidatePath('/feedbacks')
}

export async function getClientFeedbacks() {
    const session = await getSession()
    if (!session || session.user.role !== 'CLIENT') {
        throw new Error("Unauthorized")
    }

    const client = await prisma.client.findUnique({
        where: { email: session.user.email }
    })

    if (!client) {
        throw new Error("Client not found")
    }

    return await prisma.feedback.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getAllFeedbacks() {
    const session = await getSession()
    const allowedRoles = ['ADMIN', 'IA', 'PRODUCT_OWNER', 'CRM']

    if (!session || !allowedRoles.includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    return await prisma.feedback.findMany({
        include: {
            client: {
                select: {
                    name: true,
                    company: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}
