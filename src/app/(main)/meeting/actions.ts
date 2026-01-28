'use server'

import { prisma } from '@/lib/prisma'
import { startOfDay, addDays, isBefore } from 'date-fns'

export type DashboardData = {
    overdueTasks: {
        id: string
        title: string
        plannedEnd: Date
        projectName: string
        clientName: string
        daysLate: number
        assignedRole: string | null
    }[]
    upcomingTasks: {
        id: string
        title: string
        plannedEnd: Date
        projectName: string
        clientName: string
        assignedRole: string | null
    }[]
    projectHealth: {
        id: string
        name: string
        clientName: string
        status: string
        isLate: boolean
        riskLevel: 'CRITICAL' | 'WARNING' | 'HEALTHY'
        nextDeadline: Date | null
        progress: number
    }[]
    ganttProjects: {
        id: string
        name: string
        clientName: string
        phases: {
            name: string
            start: Date
            end: Date | null
            color: string
        }[]
    }[]
    customerSuccess: {
        id: string
        projectName: string
        clientName: string
        finalDeliveryDate: Date | null
        touchpoints: {
            name: string
            date: Date
            isCompleted: boolean
        }[]
    }[]
    kanbanSummary: {
        stageNumber: number
        stageName: string
        projectCount: number
        projects: { id: string, name: string, clientName: string }[]
    }[]
    stats: {
        revenueAtRisk: number
        totalProjects: number
        lateProjects: number
        roleBottlenecks: { role: string, count: number }[]
    }
}

export async function getMeetingDashboardData(): Promise<DashboardData> {
    const today = startOfDay(new Date())
    const nextWeek = addDays(today, 7)

    const projects = await prisma.project.findMany({
        where: {
            status: {
                notIn: ['DONE', 'ARCHIVED']
            }
        },
        include: {
            client: {
                select: { name: true }
            },
            tasks: {
                orderBy: {
                    plannedEnd: 'asc'
                }
            },
            stages: {
                orderBy: {
                    stageNumber: 'asc'
                }
            },
            contracts: {
                where: { isActive: true },
                include: { installments: true }
            }
        }
    })

    const overdueTasks: DashboardData['overdueTasks'] = []
    const upcomingTasks: DashboardData['upcomingTasks'] = []
    const projectHealth: DashboardData['projectHealth'] = []
    const ganttProjects: DashboardData['ganttProjects'] = []
    const customerSuccess: DashboardData['customerSuccess'] = []
    const roleCounts: Record<string, number> = {}

    let totalRevenueAtRisk = 0

    const getStageDate = (projectStages: any[], stageNum: number, type: 'start' | 'end') => {
        const stage = projectStages.find(s => s.stageNumber === stageNum)
        return type === 'start' ? stage?.startDate : stage?.endDate
    }

    for (const project of projects) {
        const currentStageTask = project.tasks.find(t => t.stageRef === project.currentStep && !t.isCompleted)
        const isLate = currentStageTask ? isBefore(currentStageTask.plannedEnd, today) : false

        // Progress calculation
        const completedStages = project.stages.filter(s => s.isCompleted).length
        const totalStagesCount = 7
        const progress = Math.round((completedStages / totalStagesCount) * 100)

        // Risk Level
        let riskLevel: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY'
        if (isLate) {
            const daysLate = Math.floor((today.getTime() - (currentStageTask?.plannedEnd.getTime() || 0)) / (1000 * 60 * 60 * 24))
            riskLevel = daysLate > 7 ? 'CRITICAL' : 'WARNING'
        }

        if (riskLevel !== 'HEALTHY') {
            const monthlyValue = project.contracts[0]?.installments[0]?.monthlyFeeValue || 0
            totalRevenueAtRisk += monthlyValue
        }

        projectHealth.push({
            id: project.id,
            name: project.name,
            clientName: project.client.name,
            status: project.status,
            isLate,
            riskLevel,
            nextDeadline: currentStageTask ? currentStageTask.plannedEnd : null,
            progress
        })

        // Collect overdue and upcoming
        for (const task of project.tasks.filter(t => !t.isCompleted)) {
            if (isBefore(task.plannedEnd, today)) {
                const daysLate = Math.floor((today.getTime() - task.plannedEnd.getTime()) / (1000 * 60 * 60 * 24))
                overdueTasks.push({
                    id: task.id,
                    title: task.title,
                    plannedEnd: task.plannedEnd,
                    projectName: project.name,
                    clientName: project.client.name,
                    daysLate,
                    assignedRole: task.assignedRole
                })

                if (task.assignedRole) {
                    roleCounts[task.assignedRole] = (roleCounts[task.assignedRole] || 0) + 1
                }
            } else if (isBefore(task.plannedEnd, nextWeek)) {
                upcomingTasks.push({
                    id: task.id,
                    title: task.title,
                    plannedEnd: task.plannedEnd,
                    projectName: project.name,
                    clientName: project.client.name,
                    assignedRole: task.assignedRole
                })
            }
        }

        // Only include projects in "Development" phase (Stages 1-4)
        if (project.currentStep > 4) continue

        const developmentStart = project.meetingDate || project.startDate
        const developmentEnd = project.goLiveDate

        if (!developmentStart || !developmentEnd) continue

        const phases = [
            {
                name: 'Desenvolvimento',
                start: developmentStart,
                end: developmentEnd,
                color: '#6366f1' // Indigo
            }
        ]

        ganttProjects.push({
            id: project.id,
            name: project.name,
            clientName: project.client.name,
            phases: phases as any
        })

        // Customer Success Touchpoints
        const finalDelivery = getStageDate(project.stages, 7, 'end')
        if (finalDelivery || project.status === 'DONE') {
            const baseDate = finalDelivery || project.updatedAt
            const touchpoints = [
                { name: 'Boas-vindas CS', days: 15 },
                { name: 'Check-in 1 Mês', days: 30 },
                { name: 'Análise de Resultados', days: 60 },
                { name: 'Revisão Trimestral', days: 90 },
                { name: 'Expansão & Feedback', days: 120 },
                { name: 'Renovação', days: 180 }
            ].map(tp => ({
                name: tp.name,
                date: addDays(baseDate, tp.days),
                isCompleted: isBefore(addDays(baseDate, tp.days), today)
            }))

            customerSuccess.push({
                id: project.id,
                projectName: project.name,
                clientName: project.client.name,
                finalDeliveryDate: finalDelivery,
                touchpoints
            })
        }
    }

    const roleBottlenecks = Object.entries(roleCounts)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count)

    overdueTasks.sort((a, b) => b.daysLate - a.daysLate)
    upcomingTasks.sort((a, b) => a.plannedEnd.getTime() - b.plannedEnd.getTime())
    ganttProjects.sort((a, b) => {
        const aStart = a.phases[0]?.start?.getTime() || 0
        const bStart = b.phases[0]?.start?.getTime() || 0
        return aStart - bStart
    })

    projectHealth.sort((a, b) => {
        const riskOrder = { 'CRITICAL': 0, 'WARNING': 1, 'HEALTHY': 2 }
        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
            return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        }
        return (a.nextDeadline?.getTime() || 0) - (b.nextDeadline?.getTime() || 0)
    })

    // Kanban Summary Calculation - Restructured into 4 specific categories
    const categories = [
        { name: "Onboarding", stageRange: [1] },
        { name: "Desenvolvimento", stageRange: [2, 3, 4, 5] },
        { name: "Otimização", stageRange: [6] },
        { name: "Manutenção", stageRange: [7] }
    ]

    const kanbanSummary: DashboardData['kanbanSummary'] = categories.map((cat, index) => {
        const projectsInBranch = projects.filter(p => cat.stageRange.includes(p.currentStep))
        return {
            stageNumber: index + 1,
            stageName: cat.name,
            projectCount: projectsInBranch.length,
            projects: projectsInBranch.map(p => ({
                id: p.id,
                name: p.name,
                clientName: p.client.name
            }))
        }
    })

    return {
        overdueTasks,
        upcomingTasks,
        projectHealth,
        ganttProjects,
        customerSuccess,
        kanbanSummary,
        stats: {
            revenueAtRisk: totalRevenueAtRisk,
            totalProjects: projects.length,
            lateProjects: projectHealth.filter(p => p.isLate).length,
            roleBottlenecks
        }
    }
}
