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

    return project
}
