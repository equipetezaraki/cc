import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany({
        where: {
            OR: [
                { faqLink: { not: null } },
                { googleSheetUrl: { not: null } },
                { technicalBriefingUrl: { not: null } }
            ]
        },
        include: {
            client: true
        }
    })

    console.log(`--- Projects with Links: ${projects.length} ---`)
    projects.forEach(p => {
        console.log(`\nProject: ${p.name} (${p.id})`)
        console.log(`  Client: ${p.client.email}`)
        console.log(`  Status: ${p.status}`)
        console.log(`  faqLink: ${p.faqLink || 'MISSING'}`)
        console.log(`  googleSheetUrl: ${p.googleSheetUrl || 'MISSING'}`)
        console.log(`  techBriefingUrl: ${p.technicalBriefingUrl || 'MISSING'}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
