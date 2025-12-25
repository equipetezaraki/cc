import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
    const hashedPassword = await bcrypt.hash('14Mar!RM', 10)

    // Delete existing admin if exists
    await prisma.user.deleteMany({
        where: { email: 'contato.tezaraki@gmail.com' }
    })

    // Create new admin
    const admin = await prisma.user.create({
        data: {
            name: 'Admin Tezaraki',
            email: 'contato.tezaraki@gmail.com',
            password: hashedPassword,
            role: 'ADMIN',
        }
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', admin.email)
    console.log('Password: 14Mar!RM')
}

createAdmin()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error(error)
        prisma.$disconnect()
    })
