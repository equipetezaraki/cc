'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function updateClientCredentials(
    clientId: string,
    email: string,
    password?: string
) {
    console.log('🔧 updateClientCredentials called with:', {
        clientId,
        email,
        hasPassword: !!password,
        passwordLength: password?.length,
        passwordValue: password
    })

    try {
        const updateData: any = {
            email,
        }

        let hashedPassword: string | undefined

        // Only update password if provided and not empty
        if (password && password.trim() !== '') {
            console.log('🔐 Hashing password...')
            hashedPassword = await bcrypt.hash(password, 10)
            updateData.passwordHash = hashedPassword
            console.log('✅ Password hashed successfully')
            console.log('📝 Hash preview:', hashedPassword.substring(0, 20) + '...')
        } else {
            console.log('⏭️  Skipping password update (empty or undefined)')
        }

        console.log('💾 Updating client in database...')
        const updated = await prisma.client.update({
            where: { id: clientId },
            data: updateData,
        })
        console.log('✅ Client updated successfully')

        // Also update User table for login
        const userUpdateData: any = {
            email,
        }
        if (hashedPassword) {
            userUpdateData.password = hashedPassword
        }

        // Find and update user by email (old email before update)
        const existingUser = await prisma.user.findFirst({
            where: {
                email: updated.email,
                role: 'CLIENT'
            }
        })

        if (existingUser) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: userUpdateData
            })
            console.log('✅ User credentials updated')
        } else {
            console.log('⚠️  No User found for this client')
        }

        revalidatePath('/clients')
        return { success: true }
    } catch (error) {
        console.error('❌ Error updating client credentials:', error)
        return { success: false, error: 'Erro ao atualizar credenciais' }
    }
}
