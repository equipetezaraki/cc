'use server'

import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'

export async function createUser(data: any) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Apenas administradores podem criar usuários." }
    }

    try {
        const hashedPassword = await bcrypt.hash(data.password, 10)

        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role as Role
            }
        })

        revalidatePath('/members')
        return { success: true }
    } catch (error) {
        console.error("Failed to create user:", error)
        return { error: "Erro ao criar usuário. Email pode já estar em uso." }
    }
}


export async function updateUser(data: any) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Apenas administradores podem editar usuários." }
    }

    try {
        const updateData: any = {
            name: data.name,
            email: data.email,
            role: data.role as Role
        }

        if (data.password && data.password.trim() !== "") {
            updateData.password = await bcrypt.hash(data.password, 10)
        }

        await prisma.user.update({
            where: { id: data.id },
            data: updateData
        })

        revalidatePath('/members')
        return { success: true }
    } catch (error) {
        console.error("Failed to update user:", error)
        return { error: "Erro ao atualizar usuário." }
    }
}

export async function deleteUser(id: string) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Apenas administradores podem remover usuários." }
    }

    try {
        const targetUser = await prisma.user.findUnique({
            where: { id }
        })

        if (targetUser?.role === 'ADMIN') {
            return { error: "Não é possível remover administradores." }
        }

        await prisma.user.delete({
            where: { id }
        })
        revalidatePath('/members')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete user:", error)
        return { error: "Erro ao remover usuário." }
    }
}

