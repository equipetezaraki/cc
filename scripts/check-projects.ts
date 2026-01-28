import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany({
        select: {
            id: true,
            name: true,
            faqLink: true,
            googleSheetUrl: true,
            technicalBriefingUrl: true,
            clientId: true,
            client: {
                select: {
                    email: true,
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    console.log('--- Last 10 Projects ---')
    projects.forEach(p => {
        console.log(`Project: ${p.name} (${p.id})`)
        console.log(`  Client: ${p.client.name} (${p.client.email})`)
        console.log(`  faqLink: ${p.faqLink || 'NULL'}`)
        console.log(`  googleSheetUrl: ${p.googleSheetUrl || 'NULL'}`)
        console.log(`  techBriefingUrl: ${p.technicalBriefingUrl || 'NULL'}`)
        console.log('------------------------')
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
