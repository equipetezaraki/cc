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

    console.log('--- Clients and Projects ---')
    clients.forEach(c => {
        if (c.projects.length > 1) {
            console.log(`Client: ${c.name} (${c.email}) has ${c.projects.length} projects`)
            c.projects.forEach(p => {
                console.log(`  Project: ${p.name} (${p.id})`)
                console.log(`    faqLink: ${p.faqLink || 'NULL'}`)
                console.log(`    createdAt: ${p.createdAt}`)
            })
        } else if (c.projects.length === 1) {
            console.log(`Client: ${c.name} (${c.email}) has 1 project: ${c.projects[0].name} (FAQ: ${c.projects[0].faqLink || 'NULL'})`)
        }
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
