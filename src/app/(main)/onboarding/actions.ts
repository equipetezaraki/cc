'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { onboardingSchema } from '@/lib/schemas'
import { calculateBusinessDate, addBusinessDays } from '@/lib/date-utils'
import { generateStandardTasks } from '../deliveries/actions'

export async function submitOnboarding(data: z.infer<typeof onboardingSchema>) {
    const validatedFields = onboardingSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Dados inválidos. Verifique o formulário." }
    }

    const {
        clientName, companyName, phone,
        projectName, startDate, funnelCount
    } = validatedFields.data

    try {
        // 1. Create Client
        // Generate unique placeholder email using UUID to avoid duplicates
        const uniqueId = crypto.randomUUID().split('-')[0]
        const placeholderEmail = `client-${uniqueId}@placeholder.com`

        const client = await prisma.client.create({
            data: {
                name: clientName,
                company: companyName,
                email: placeholderEmail,
                phone,
            }
        })

        // 2. Calculate Dates (The Core Logic)
        // Etapa 1: Definição / Reunião (d0)
        const dateStep1 = startDate

        // Etapa 2: Validação de Esboços (d0 + 2 dias úteis)
        const dateStep2 = calculateBusinessDate(dateStep1, 2)

        // Etapa 3: Setup & Automações (Fim da Etapa 2 + 3 dias úteis)
        const dateStep3 = calculateBusinessDate(dateStep2, 3)

        // Etapa 4: Desenv. Comportamento (Fim da Etapa 3 + (3 * num_funis) dias úteis)
        const daysForFunnel = 3 * funnelCount
        const dateStep4 = calculateBusinessDate(dateStep3, daysForFunnel)

        // Etapa 5: Go-Live (Fim da Etapa 4 + 1 dia corrido/útil - using business for safety)
        const dateStep5 = calculateBusinessDate(dateStep4, 1)

        // Etapa 6: Maturação (Início da Op. (Step 5) + 30 dias corridos)
        const dateStep6 = new Date(dateStep5)
        dateStep6.setDate(dateStep6.getDate() + 30)

        // Etapa 7: Entrega Final (Data do Fim da Maturação)
        const dateStep7 = dateStep6

        // 3. Create Project
        const project = await prisma.project.create({
            data: {
                name: projectName,
                startDate,
                funnelCount,
                clientId: client.id,
                status: 'ONBOARDING',
                currentStep: 1,
            }
        })

        // 3.1 Create Project Stages (Macro Control)
        const stagesToCreate = []

        // Etapas 1-3: uma entrada cada
        for (let i = 1; i <= 3; i++) {
            stagesToCreate.push({
                projectId: project.id,
                stageNumber: i,
                funnelNumber: null,
                isCompleted: false
            })
        }

        // Etapa 4: uma entrada por funil
        for (let f = 1; f <= funnelCount; f++) {
            stagesToCreate.push({
                projectId: project.id,
                stageNumber: 4,
                funnelNumber: f,
                isCompleted: false
            })
        }

        // Etapas 5-7: uma entrada cada
        for (let i = 5; i <= 7; i++) {
            stagesToCreate.push({
                projectId: project.id,
                stageNumber: i,
                funnelNumber: null,
                isCompleted: false
            })
        }

        await prisma.projectStage.createMany({
            data: stagesToCreate
        })

        // 4. Create Tasks (for team members - "Minhas Entregas")

        // 4.1 Create specific Closer Briefing Task (not in standard CSV)
        await prisma.task.create({
            data: {
                title: "Preencher Briefing (Contexto & Sistemas)",
                description: "Tarefa exclusiva para o Closer preencher o contexto do projeto e desenhar os funis.",
                plannedStart: startDate,
                plannedEnd: calculateBusinessDate(startDate, 1),
                assignedRole: 'CLOSER',
                projectId: project.id,
                isCompleted: false
            }
        })

        // 4.2 Generate Standard Tasks (PO, IA, CRM)
        await generateStandardTasks(project.id)

    } catch (error) {
        console.error("Error creating project:", error)
        return { error: "Erro ao criar projeto. Tente novamente." }
    }

    redirect('/kanban')
}
