import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const templates = await prisma.stageTemplate.findMany({
        select: { stageNumber: true, name: true }
    })
    console.log(templates)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
