'use server'

import { prisma } from '@/lib/prisma'

export async function getClients() {
    const clients = await prisma.client.findMany({
        orderBy: {
            code: 'asc'
        },
        include: {
            projects: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                }
            }
        }
    })

    return clients
}

export async function getClientById(id: string) {
    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            projects: {
                include: {
                    stages: true,
                }
            }
        }
    })

    return client
}
