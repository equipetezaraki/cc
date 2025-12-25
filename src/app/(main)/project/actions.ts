'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateBusinessDate } from '@/lib/date-utils'
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

        // 2. Update Project with Meeting Date and Status
        await prisma.project.update({
            where: { id: project.id },
            data: {
                meetingDate: date,
                status: 'ACTIVE', // Move out of ONBOARDING
                currentStep: 2, // Start at Stage 2 (Validação de Esboços) after onboarding
            }
        })

        // 3. Mark Task as Completed
        await prisma.task.update({
            where: { id: taskId },
            data: {
                isCompleted: true,
                actualEnd: new Date() // Mark completion time
            }
        })

        // 4. Fetch Templates
        const stageTemplates = await prisma.stageTemplate.findMany({
            orderBy: { stageNumber: 'asc' },
            include: { tasks: true }
        })

        // 5. Generate Stages and Tasks from Templates
        // Logic for dates is still based on Stage Number for now to preserve business rules

        // Calculate standard dates used in logic
        const s2End = date
        const s2Start = calculateBusinessDate(s2End, -2)
        const s3Start = s2End
        const s3End = calculateBusinessDate(s3Start, 3)
        const s4Start = s3End
        const daysForFunnel = 3 * funnelCount
        const s4End = calculateBusinessDate(s4Start, daysForFunnel)
        const s5Start = s4End
        const s5End = calculateBusinessDate(s5Start, 1)
        const s6Start = s5End
        const s6End = new Date(s6Start)
        s6End.setDate(s6End.getDate() + 30) // +30 days (calendar)
        const s7Start = s6End
        const s7End = s6End

        // 5. Generate Stages and Tasks from Templates
        // Dynamic date calculation based on template durations

        let currentStartDate = date // Start from the meeting date (S2 End)

        // We actually need to work backwards for Stage 2 if the meeting date is the END of Stage 2.
        // But the previous statuses are already "passed" or "skipped" in a sense, or we just record them.
        // The prompt implies "timeline for the project".

        // Let's refine the "Anchor Date". 
        // Logic in original code:
        // s2End = date (Meeting Date)
        // s2Start = s2End - 2 days
        // So Stage 2 is anchored at End.
        // Stage 3 Starts at s2End.

        // We need to find Stage 2 template to know its duration?
        // Let's assume logical ordering by stageNumber.

        let previousStageEnd = date

        for (const template of stageTemplates) {
            let startDate: Date | null = null
            let endDate: Date | null = null
            const duration = template.durationDays || 0 // Default to 0 if not set

            if (template.stageNumber === 1) {
                // Onboarding - keeps as null/no dates usually? Or maybe we want to track it?
                // Original code: "No dates"
                // Let's keep it null for now unless we want to track backwards?
            } else if (template.stageNumber === 2) {
                // Validação de Esboços
                // Ancored at END = date
                endDate = date
                // Calculate Start based on duration
                // We need a helper to subtract business days? 
                // calculateBusinessDate handles positive adds. Negative? Not sure if implemented.
                // Assuming we can just rough it or existing logic: s2Start = calculateBusinessDate(s2End, -2)
                // If duration is dynamic, we need to subtract.
                // Let's just use the logic: Start = End - duration (roughly)
                // Since calculateBusinessDate might not handle negative, let's just subtract calendar days for now or look for existing valid negative usage.
                // The original code used `calculateBusinessDate(s2End, -2)`. So it DOES support negative.
                startDate = calculateBusinessDate(endDate, -duration)

                previousStageEnd = endDate
            }
            else if (template.stageNumber === 4 && funnelCount > 0) {
                // Special Funnel Handling
                // Starts after previous stage (Stage 3)

                let currentFunnelStart = previousStageEnd

                for (let f = 1; f <= funnelCount; f++) {
                    const funnelDuration = duration > 0 ? duration : 3 // Default 3 if 0
                    const currentFunnelEnd = calculateBusinessDate(currentFunnelStart, funnelDuration)

                    await prisma.projectStage.create({
                        data: {
                            projectId: project.id,
                            stageNumber: template.stageNumber,
                            funnelNumber: f,
                            isCompleted: false,
                            startDate: currentFunnelStart,
                            endDate: currentFunnelEnd,
                        }
                    })

                    // Tasks for Funnel
                    for (const taskTpl of template.tasks) {
                        const taskDuration = taskTpl.durationDays || funnelDuration // Use task duration if specific, else stage
                        // Note: Task start/end usually matches stage or sub-part. simpler to match stage for now.
                        await prisma.task.create({
                            data: {
                                title: `${taskTpl.title} (Funil ${f})`,
                                description: taskTpl.description,
                                plannedStart: currentFunnelStart,
                                plannedEnd: currentFunnelEnd, // or calculated from taskDuration
                                assignedRole: taskTpl.role,
                                projectId: project.id,
                                stageRef: template.stageNumber,
                            }
                        })
                    }
                    currentFunnelStart = currentFunnelEnd
                }
                previousStageEnd = currentFunnelStart // Update for next stage
                continue; // Skip the default creation below
            }
            else {
                // Generio Stage (3, 5, 6, 7 etc)
                // Starts at previousStageEnd
                startDate = previousStageEnd
                endDate = calculateBusinessDate(startDate, duration)

                previousStageEnd = endDate
            }

            if (template.stageNumber !== 4 || funnelCount === 0) {
                // Create Stage
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

                // Create Tasks
                for (const taskTpl of template.tasks) {
                    await prisma.task.create({
                        data: {
                            title: taskTpl.title,
                            description: taskTpl.description,
                            plannedStart: startDate || new Date(),
                            plannedEnd: endDate || new Date(),
                            assignedRole: taskTpl.role,
                            projectId: project.id,
                            stageRef: template.stageNumber,
                        }
                    })
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
