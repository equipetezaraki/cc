'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteProject(projectId: string) {
    try {
        // Delete project - Prisma will cascade delete all related records
        // (ProjectStage, Task, Briefing, ProjectTimeline) based on schema relations
        await prisma.project.delete({
            where: {
                id: projectId
            }
        })

        // Revalidate the archive page to reflect the deletion
        revalidatePath('/archive')

        return { success: true }
    } catch (error) {
        console.error('Error deleting project:', error)
        return { success: false, error: 'Erro ao excluir projeto. Tente novamente.' }
    }
}
