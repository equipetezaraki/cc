'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteClient(clientId: string) {
    try {
        // First, get the client to find their email
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: { email: true }
        })

        if (!client) {
            return { success: false, error: 'Cliente não encontrado' }
        }

        // Delete the associated user account (if exists)
        await prisma.user.deleteMany({
            where: {
                email: client.email,
                role: 'CLIENT'
            }
        })

        // Delete client (cascade will delete related projects, stages, tasks, etc.)
        await prisma.client.delete({
            where: { id: clientId }
        })

        revalidatePath('/clients')
        revalidatePath('/members') // Also revalidate members in case it was cached
        return { success: true }
    } catch (error) {
        console.error('Error deleting client:', error)
        return { success: false, error: 'Erro ao excluir cliente' }
    }
}
