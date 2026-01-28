import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany({
        include: {
            client: true
        },
        orderBy: { createdAt: 'desc' }
    })

    console.log('--- Extensive Project Link Check ---')
    for (const p of projects) {
        if (p.client.email.includes('teste')) {
            console.log(`\nProject: ${p.name} (${p.id})`)
            console.log(`  Client: ${p.client.name} (${p.client.email})`)
            console.log(`  Status: ${p.status}`)
            console.log(`  faqLink: ${p.faqLink || 'MISSING'}`)
            console.log(`  googleSheetUrl: ${p.googleSheetUrl || 'MISSING'}`)
            console.log(`  techBriefingUrl: ${p.technicalBriefingUrl || 'MISSING'}`)
            console.log(`  requirementsLink: ${p.requirementsLink || 'MISSING'}`)
            console.log(`  credentialsLink: ${p.credentialsLink || 'MISSING'}`)
            console.log(`  driveFolderId: ${p.driveFolderId || 'MISSING'}`)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
