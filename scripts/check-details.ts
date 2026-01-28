import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const clients = await prisma.client.findMany({
        include: {
            projects: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    console.log('--- Detailed Client & Project Check ---')
    for (const c of clients) {
        console.log(`\nClient: ${c.name} (${c.email})`)
        if (c.projects.length === 0) {
            console.log('  No projects.')
            continue
        }

        c.projects.forEach((p, i) => {
            console.log(`  [${i + 1}] Project: ${p.name}`)
            console.log(`      ID: ${p.id}`)
            console.log(`      Status: ${p.status}`)
            console.log(`      FAQ Link: ${p.faqLink || 'MISSING'}`)
            console.log(`      Created: ${p.createdAt.toISOString()}`)
        })
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
