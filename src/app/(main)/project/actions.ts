'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateBusinessDate } from '@/lib/date-utils'
import { calculateProjectGoLiveDate } from '@/lib/project-utils'
import { generateStandardTasks } from '../deliveries/actions'

export async function scheduleProjectMeeting(taskId: string, date: Date) {
    try {
        // 1. Get Task and Project
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        })

        if (!task) return { error: "Tarefa não encontrada." }

        const project = task.project
        const funnelCount = project.funnelCount

        // 2. Fetch Templates (moved up to determine next step dynamically)
        const stageTemplates = await prisma.stageTemplate.findMany({
            orderBy: { stageNumber: 'asc' },
            include: { tasks: true }
        })

        // 3. Find Next Step
        const anchorStageNumber = task.stageRef || 1
        const nextStage = stageTemplates.find(t => t.stageNumber > anchorStageNumber)
        const nextStageNumber = nextStage?.stageNumber || anchorStageNumber + 1

        // 4. Recalculate Go-Live Date based on new Meeting Date
        const newGoLiveDate = calculateProjectGoLiveDate({
            projectType: project.projectType || 'Tezaraki Essential',
            funnelCount: project.funnelCount,
            startDate: date
        })

        // 5. Update Project with Meeting Date, Status, Go-Live Date and dynamic Next Step
        await prisma.project.update({
            where: { id: project.id },
            data: {
                meetingDate: date,
                goLiveDate: newGoLiveDate,
                status: 'ACTIVE', // Move out of ONBOARDING
                currentStep: nextStageNumber,
            }
        })

        // 5. Mark Task as Completed
        await prisma.task.update({
            where: { id: taskId },
            data: {
                isCompleted: true,
                actualEnd: new Date() // Mark completion time
            }
        })

        // 6. Generate Stages and Tasks from Templates
        const anchorStageTemplate = stageTemplates.find(t => t.stageNumber === anchorStageNumber)

        let currentStages = []
        let currentTasks = []

        // We'll calculate dates for ALL stages in a single pass or relative to anchor
        // First, set durations and anchors
        const stageDates = new Map<number, { start: Date | null, end: Date | null }>()

        // 1. Set Anchor Stage dates
        // If it's a "scheduling" task, we usually anchor at the END of the stage (Meeting Date)
        const anchorEnd = date
        const anchorDuration = anchorStageTemplate?.durationDays || 0
        let anchorStart = calculateBusinessDate(anchorEnd, -anchorDuration)

        // IF Stage 1 is the anchor, force it to start at creation date
        if (anchorStageNumber === 1) {
            anchorStart = project.startDate
        }

        stageDates.set(anchorStageNumber, { start: anchorStart, end: anchorEnd })

        // 2. Propagate BACKWARDS
        const beforeStages = stageTemplates.filter(t => t.stageNumber < anchorStageNumber).sort((a, b) => b.stageNumber - a.stageNumber)
        let lastStart = anchorStart
        for (const st of beforeStages) {
            const end = lastStart
            let start = calculateBusinessDate(end, -st.durationDays)

            // IF it's Stage 1, force it to start at the project creation date
            if (st.stageNumber === 1) {
                start = project.startDate
            }

            stageDates.set(st.stageNumber, { start, end })
            lastStart = start
        }

        // 3. Propagate FORWARDS
        const afterStages = stageTemplates.filter(t => t.stageNumber > anchorStageNumber).sort((a, b) => a.stageNumber - b.stageNumber)
        let lastEnd = anchorEnd
        for (const st of afterStages) {
            const start = lastEnd
            let duration = st.durationDays
            if ((st as any).isPerFunnel) {
                duration = duration * funnelCount
            }

            let end = calculateBusinessDate(start, duration)

            // Override Stage 5 (Go-Live) end date with the project's goLiveDate
            if (st.stageNumber === 5) {
                end = newGoLiveDate
            }

            stageDates.set(st.stageNumber, { start, end })
            lastEnd = end
        }

        // 4. Create or Update everything in DB
        for (const template of stageTemplates) {
            const dates = stageDates.get(template.stageNumber)
            const startDate = dates?.start || null
            const endDate = dates?.end || null

            if ((template as any).isPerFunnel && funnelCount > 0) {
                // Per Funnel Logic
                let funnelStart = startDate || date
                for (let f = 1; f <= funnelCount; f++) {
                    const funnelDuration = template.durationDays
                    const funnelEnd = calculateBusinessDate(funnelStart, funnelDuration)

                    // Manual Upsert Stage (to avoid issues with null in composite keys)
                    const existingStage = await prisma.projectStage.findFirst({
                        where: {
                            projectId: project.id,
                            stageNumber: template.stageNumber,
                            funnelNumber: f,
                        }
                    })

                    if (existingStage) {
                        await prisma.projectStage.update({
                            where: { id: existingStage.id },
                            data: {
                                startDate: funnelStart,
                                endDate: funnelEnd,
                            }
                        })
                    } else {
                        await prisma.projectStage.create({
                            data: {
                                projectId: project.id,
                                stageNumber: template.stageNumber,
                                funnelNumber: f,
                                isCompleted: false,
                                startDate: funnelStart,
                                endDate: funnelEnd,
                            }
                        })
                    }

                    for (const taskTpl of template.tasks) {
                        const taskTitle = `${taskTpl.title} (Funil ${f})`

                        // Check if task already exists
                        const existingTask = await prisma.task.findFirst({
                            where: {
                                projectId: project.id,
                                title: taskTitle,
                                stageRef: template.stageNumber
                            }
                        })

                        if (existingTask) {
                            await prisma.task.update({
                                where: { id: existingTask.id },
                                data: {
                                    plannedStart: funnelStart,
                                    plannedEnd: funnelEnd,
                                    description: taskTpl.description,
                                    assignedRole: taskTpl.role,
                                }
                            })
                        } else {
                            await prisma.task.create({
                                data: {
                                    title: taskTitle,
                                    description: taskTpl.description,
                                    plannedStart: funnelStart,
                                    plannedEnd: funnelEnd,
                                    assignedRole: taskTpl.role,
                                    projectId: project.id,
                                    stageRef: template.stageNumber,
                                }
                            })
                        }
                    }
                    funnelStart = funnelEnd
                }
            } else {
                // Standard Stage
                // Manual Upsert Stage
                const existingStage = await prisma.projectStage.findFirst({
                    where: {
                        projectId: project.id,
                        stageNumber: template.stageNumber,
                        funnelNumber: null,
                    }
                })

                if (existingStage) {
                    await prisma.projectStage.update({
                        where: { id: existingStage.id },
                        data: {
                            startDate: startDate,
                            endDate: endDate,
                        }
                    })
                } else {
                    await prisma.projectStage.create({
                        data: {
                            projectId: project.id,
                            stageNumber: template.stageNumber,
                            funnelNumber: null,
                            isCompleted: false,
                            startDate: startDate,
                            endDate: endDate
                        }
                    })
                }

                for (const taskTpl of template.tasks) {
                    // Check if task already exists
                    const existingTask = await prisma.task.findFirst({
                        where: {
                            projectId: project.id,
                            title: taskTpl.title,
                            stageRef: template.stageNumber
                        }
                    })

                    if (existingTask) {
                        const taskStart = template.stageNumber === 5 ? (endDate || new Date()) : (startDate || new Date())
                        const taskEnd = endDate || new Date()

                        await prisma.task.update({
                            where: { id: existingTask.id },
                            data: {
                                plannedStart: taskStart,
                                plannedEnd: taskEnd,
                                description: taskTpl.description,
                                assignedRole: taskTpl.role,
                            }
                        })
                    } else {
                        const taskStart = template.stageNumber === 5 ? (endDate || new Date()) : (startDate || new Date())
                        const taskEnd = endDate || new Date()

                        await prisma.task.create({
                            data: {
                                title: taskTpl.title,
                                description: taskTpl.description,
                                plannedStart: taskStart,
                                plannedEnd: taskEnd,
                                assignedRole: taskTpl.role,
                                projectId: project.id,
                                stageRef: template.stageNumber,
                            }
                        })
                    }
                }
            }
        }

        // revalidatePath('/deliveries') // Old path?
        revalidatePath('/kanban')
        return { success: true }

    } catch (error) {
        console.error("Error scheduling project meeting:", error)
        return { error: "Erro ao agendar reunião." }
    }
}
