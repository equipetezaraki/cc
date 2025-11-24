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
    }[]
    upcomingTasks: {
        id: string
        title: string
        plannedEnd: Date
        projectName: string
        clientName: string
    }[]
    projectHealth: {
        id: string
        name: string
        clientName: string
        status: string
        isLate: boolean
        nextDeadline: Date | null
    }[]
}

export async function getMeetingDashboardData(): Promise<DashboardData> {
    const today = startOfDay(new Date())
    const nextWeek = addDays(today, 7)

    // Fetch all active projects with their tasks
    const projects = await prisma.project.findMany({
        where: {
            status: {
                notIn: ['DONE', 'ARCHIVED'] // Exclude completed and archived projects
            }
        },
        include: {
            client: {
                select: { name: true }
            },
            tasks: {
                where: {
                    isCompleted: false
                },
                orderBy: {
                    plannedEnd: 'asc'
                }
            }
        }
    })

    const overdueTasks: DashboardData['overdueTasks'] = []
    const upcomingTasks: DashboardData['upcomingTasks'] = []
    const projectHealth: DashboardData['projectHealth'] = []

    for (const project of projects) {
        // Determine project health
        // A project is "Late" if its current stage task is overdue
        const currentStageTask = project.tasks.find(t => t.stageRef === project.currentStep)
        const isLate = currentStageTask ? isBefore(currentStageTask.plannedEnd, today) : false

        projectHealth.push({
            id: project.id,
            name: project.name,
            clientName: project.client.name,
            status: project.status,
            isLate,
            nextDeadline: currentStageTask ? currentStageTask.plannedEnd : null
        })

        // Collect tasks for lists
        for (const task of project.tasks) {
            if (isBefore(task.plannedEnd, today)) {
                const daysLate = Math.floor((today.getTime() - task.plannedEnd.getTime()) / (1000 * 60 * 60 * 24))
                overdueTasks.push({
                    id: task.id,
                    title: task.title,
                    plannedEnd: task.plannedEnd,
                    projectName: project.name,
                    clientName: project.client.name,
                    daysLate
                })
            } else if (isBefore(task.plannedEnd, nextWeek)) {
                upcomingTasks.push({
                    id: task.id,
                    title: task.title,
                    plannedEnd: task.plannedEnd,
                    projectName: project.name,
                    clientName: project.client.name
                })
            }
        }
    }

    // Sort lists
    overdueTasks.sort((a, b) => a.plannedEnd.getTime() - b.plannedEnd.getTime())
    upcomingTasks.sort((a, b) => a.plannedEnd.getTime() - b.plannedEnd.getTime())
    projectHealth.sort((a, b) => {
        // Sort by late first, then by deadline
        if (a.isLate && !b.isLate) return -1
        if (!a.isLate && b.isLate) return 1
        if (!a.nextDeadline) return 1
        if (!b.nextDeadline) return -1
        return a.nextDeadline.getTime() - b.nextDeadline.getTime()
    })

    return {
        overdueTasks,
        upcomingTasks,
        projectHealth
    }
}
