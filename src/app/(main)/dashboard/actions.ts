'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { subDays, startOfDay, endOfDay, eachHourOfInterval, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function getClientProject() {
    const session = await getSession()
    console.log('🔍 [Dashboard] Session:', session)

    // Check if session exists and has user email
    // The session structure might be { user: { email: ... } } or just { email: ... } depending on auth implementation
    // Based on logs, it is session.user.email
    const userEmail = session?.user?.email || session?.email

    if (!userEmail) {
        console.log('❌ [Dashboard] No session or email found')
        return null
    }

    // Find the client associated with the user email
    const client = await prisma.client.findUnique({
        where: { email: userEmail },
        include: {
            projects: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    console.log('🔍 [Dashboard] Client found:', client ? client.email : 'No client')
    console.log('🔍 [Dashboard] Projects found:', client?.projects?.length || 0)

    if (!client || client.projects.length === 0) return null

    const project = client.projects[0]

    // Check if onboarding task exists
    const onboardingTask = await prisma.task.findFirst({
        where: {
            projectId: project.id,
            title: "Agendar Apresentação de Esboços"
        }
    })

    return {
        ...project,
        hasPendingOnboardingTask: !!onboardingTask
    }
}

export async function getDashboardMetrics(projectId: string) {
    const now = new Date()
    const startOfToday = startOfDay(now)
    const endOfToday = endOfDay(now)
    const last30Days = subDays(now, 30)

    // 1. Messages by Hour (24h Curve)
    const messagesLast24h = await prisma.messageHistory.findMany({
        where: {
            projectId,
            createdAt: {
                gte: subDays(now, 1)
            }
        },
        select: {
            createdAt: true,
            senderType: true
        }
    })

    const messagesByHour = eachHourOfInterval({
        start: subDays(now, 1),
        end: now
    }).map(hour => {
        const count = messagesLast24h.filter(msg =>
            msg.createdAt >= hour && msg.createdAt < new Date(hour.getTime() + 60 * 60 * 1000)
        ).length
        return {
            hour: format(hour, 'HH:mm'),
            count
        }
    })

    // 2. Average Response Time (Simplified approximation)
    // This is complex to calculate accurately without specific "reply-to" tracking in SQL efficiently
    // For now, we'll return a placeholder or simple calculation if possible
    // A proper implementation would require raw SQL or complex logic
    const avgResponseTime = "2m 30s" // Placeholder for MVP

    // 3. AI Activations & Total Messages
    const totalMessages = await prisma.messageHistory.count({
        where: { projectId }
    })

    const aiMessages = await prisma.messageHistory.count({
        where: {
            projectId,
            senderType: 'ai'
        }
    })

    // 4. Unique Leads
    const uniqueLeads = await prisma.activeConversation.count({
        where: { projectId }
    })

    // 5. Top Objections, Intents, FAQs (from AiInsights)
    const insights = await prisma.aiInsight.findMany({
        where: { projectId },
        orderBy: { analyzedAt: 'desc' },
        take: 100
    })

    const objectionsMap = new Map<string, number>()
    const intentsMap = new Map<string, number>()

    insights.forEach(insight => {
        insight.objectionsDetected.forEach(obj => {
            objectionsMap.set(obj, (objectionsMap.get(obj) || 0) + 1)
        })
        if (insight.intentDetected) {
            intentsMap.set(insight.intentDetected, (intentsMap.get(insight.intentDetected) || 0) + 1)
        }
    })

    const topObjections = Array.from(objectionsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }))

    const topIntents = Array.from(intentsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }))

    // 6. Leads by Funnel Stage
    const leadsByStage = await prisma.activeConversation.groupBy({
        by: ['funnelStage'],
        where: { projectId },
        _count: {
            _all: true
        }
    })

    const funnelStats = leadsByStage.map(stage => ({
        name: stage.funnelStage || 'Sem Etapa',
        value: stage._count._all
    }))

    // 7. AI Retention Rate
    const fullyHandled = await prisma.aiInsight.count({
        where: {
            projectId,
            aiHandledFully: true
        }
    })

    const humanIntervention = await prisma.aiInsight.count({
        where: {
            projectId,
            humanInterventionNeeded: true
        }
    })

    const totalAnalyzed = fullyHandled + humanIntervention
    const retentionRate = totalAnalyzed > 0 ? Math.round((fullyHandled / totalAnalyzed) * 100) : 0

    // 8. Sentiment Analysis
    const sentimentStats = await prisma.aiInsight.groupBy({
        by: ['sentimentLabel'],
        where: { projectId },
        _count: {
            _all: true
        }
    })

    const sentimentData = sentimentStats.map(stat => ({
        name: stat.sentimentLabel || 'Neutro',
        value: stat._count._all
    }))

    return {
        messagesByHour,
        avgResponseTime,
        totalMessages,
        aiMessages,
        uniqueLeads,
        topObjections,
        topIntents,
        funnelStats,
        retentionRate,
        sentimentData
    }
}
