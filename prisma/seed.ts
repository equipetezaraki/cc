import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'contato.tezaraki@gmail.com'
    const password = 'admin' // Initial password, should be changed
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: Role.ADMIN
        },
        create: {
            email,
            name: 'Admin Tezaraki',
            password: hashedPassword,
            role: Role.ADMIN,
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
