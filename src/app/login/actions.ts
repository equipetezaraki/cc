'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function authenticate(data: any) {
    const { email, password } = data

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return { error: "Credenciais inválidas." }
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)

        if (!passwordsMatch) {
            return { error: "Credenciais inválidas." }
        }

        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, expires })

        const cookieStore = await cookies()
        cookieStore.set('session', session, { expires, httpOnly: true })

    } catch (error) {
        console.error("Login error:", error)
        return { error: "Erro ao realizar login." }
    }

    redirect('/')
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.set('session', '', { expires: new Date(0) })
    redirect('/login')
}
