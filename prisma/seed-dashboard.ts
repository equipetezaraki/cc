import { PrismaClient } from '@prisma/client'
import { subHours, subDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
    const email = 'teste@gmail.com'

    console.log(`🔍 Finding client with email: ${email}`)
    const client = await prisma.client.findUnique({
        where: { email },
        include: { projects: true }
    })

    if (!client) {
        console.error('❌ Client not found!')
        return
    }

    let project
    if (client.projects.length === 0) {
        console.log('⚠️ Client has no projects. Creating one...')
        project = await prisma.project.create({
            data: {
                name: 'Projeto Demo Dashboard',
                clientId: client.id,
                startDate: new Date(),
                status: 'ONBOARDING',
                funnelCount: 1
            }
        })
        console.log(`✅ Created project: ${project.name}`)
    } else {
        project = client.projects[0]
    }

    const projectId = project.id
    console.log(`✅ Using project: ${project.name} (${projectId})`)

    console.log('🧹 Cleaning up old analytics data...')
    await prisma.messageHistory.deleteMany({ where: { projectId } })
    await prisma.aiInsight.deleteMany({ where: { projectId } })
    await prisma.activeConversation.deleteMany({ where: { projectId } })

    console.log('🌱 Seeding dashboard data...')

    // 1. Create Active Conversations (Leads)
    const funnelStages = ['Novo', 'Qualificação', 'Agendamento', 'Negociação', 'Fechado']
    const conversations = []

    for (let i = 0; i < 50; i++) {
        const stage = funnelStages[Math.floor(Math.random() * funnelStages.length)]
        const conv = await prisma.activeConversation.create({
            data: {
                projectId,
                sessionId: `session-${i}`,
                leadName: `Lead Teste ${i + 1}`,
                stage,
                createdAt: subDays(new Date(), Math.floor(Math.random() * 30)),
                dtUltimaMensagem: new Date(),
            }
        })
        conversations.push(conv)
    }

    // 2. Create Message History (24h Curve & Volume)
    // Generate messages for the last 24 hours with a realistic curve (more during day, less at night)
    const now = new Date()
    let totalMessages = 0
    let aiMessages = 0

    for (let i = 0; i < 24; i++) {
        const hourDate = subHours(now, i)
        const hour = hourDate.getHours()

        // Simple curve: more messages between 9h and 18h
        let baseVolume = 5
        if (hour >= 9 && hour <= 18) baseVolume = 20
        if (hour >= 19 && hour <= 22) baseVolume = 10

        const volume = Math.floor(baseVolume * (0.5 + Math.random())) // Randomize a bit

        for (let j = 0; j < volume; j++) {
            const isAi = Math.random() > 0.4 // 60% AI messages
            const msgDate = new Date(hourDate.getTime() + Math.random() * 60 * 60 * 1000)

            await prisma.messageHistory.create({
                data: {
                    projectId,
                    conversationId: conversations[Math.floor(Math.random() * conversations.length)].id,
                    senderType: isAi ? 'ai' : 'human',
                    messageContent: isAi ? 'Resposta da IA...' : 'Pergunta do cliente...',
                    messageData: { type: isAi ? 'ai' : 'human', content: '...' },
                    createdAt: msgDate
                }
            })

            totalMessages++
            if (isAi) aiMessages++
        }
    }

    // 3. Create AI Insights
    const sentiments = ['Positivo', 'Neutro', 'Negativo']
    const objections = ['Preço Alto', 'Sem Tempo', 'Precisa de Aprovação', 'Concorrente', 'Dúvida Técnica']
    const intents = ['Compra', 'Suporte', 'Orçamento', 'Demonstração', 'Dúvida']

    for (const conv of conversations) {
        const hasInsight = Math.random() > 0.3
        if (hasInsight) {
            const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
            const objection = Math.random() > 0.7 ? [objections[Math.floor(Math.random() * objections.length)]] : []
            const intent = Math.random() > 0.5 ? intents[Math.floor(Math.random() * intents.length)] : null
            const fullyHandled = Math.random() > 0.4

            await prisma.aiInsight.create({
                data: {
                    projectId,
                    conversationId: conv.id,
                    sentimentLabel: sentiment,
                    objectionsDetected: objection,
                    intentDetected: intent,
                    aiHandledFully: fullyHandled,
                    humanInterventionNeeded: !fullyHandled,
                    analyzedAt: new Date()
                }
            })
        }
    }

    console.log(`✅ Seed complete!`)
    console.log(`- ${conversations.length} Active Conversations`)
    console.log(`- ${totalMessages} Messages (${aiMessages} AI)`)
    console.log(`- Dashboard should now be populated.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
