'use server'

import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function registerUser(data: any) {
    const { name, email, password } = data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: "Este email já está em uso." }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CLOSER' // Default role for self-registration
            }
        })

        // Create session immediately after registration
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, expires })

        const cookieStore = await cookies()
        cookieStore.set('session', session, { expires, httpOnly: true })

    } catch (error) {
        console.error("Registration error:", error)
        return { error: "Erro ao criar conta." }
    }

    redirect('/')
}
