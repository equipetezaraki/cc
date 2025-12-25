import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestClientWithUser() {
    const testEmail = 'cliente.teste@example.com'
    const testPassword = '123456'

    // Delete existing if any
    await prisma.user.deleteMany({ where: { email: testEmail } })
    await prisma.client.deleteMany({ where: { email: testEmail } })

    // Create client
    const hashedPassword = await bcrypt.hash(testPassword, 10)

    const client = await prisma.client.create({
        data: {
            name: 'Cliente Teste',
            company: 'Empresa Teste',
            email: testEmail,
            phone: '5511999999999',
            passwordHash: hashedPassword,
        }
    })

    // Create user for login
    const user = await prisma.user.create({
        data: {
            name: 'Cliente Teste',
            email: testEmail,
            password: hashedPassword,
            role: 'CLIENT',
        }
    })

    console.log('✅ Test client created successfully!')
    console.log('📧 Email:', testEmail)
    console.log('🔐 Password:', testPassword)
    console.log('👤 Client ID:', client.id)
    console.log('🆔 User ID:', user.id)
    console.log('\nYou can now login with these credentials!')
}

createTestClientWithUser()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error('❌ Error:', error)
        prisma.$disconnect()
    })
