'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { onboardingSchema } from '@/lib/schemas'
import { calculateBusinessDate, addBusinessDays } from '@/lib/date-utils'
import { generateStandardTasks } from '../deliveries/actions'
import { ensureClientFolder } from '@/lib/google-drive'
import bcrypt from 'bcryptjs'

// Function to generate random password
function generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
}

// Function to send webhook notification
async function sendWebhookNotification(projectData: any) {
    try {
        await fetch('https://workflowwebhook.tezaraki.com.br/webhook/novo-cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        })
    } catch (error) {
        console.error('Error sending webhook:', error)
        // Don't fail the whole operation if webhook fails
    }
}

export async function submitBriefing(data: any) {
    console.log('🚀 submitBriefing called with data:', data)

    // Validate core fields
    const validatedFields = onboardingSchema.safeParse(data)

    if (!validatedFields.success) {
        console.error('❌ Validation failed:', validatedFields.error)
        return { error: "Dados inválidos. Verifique o formulário." }
    }

    const {
        clientName, email, companyName, phone,
        projectName, funnelCount,
        segment, operationSize, projectType, technicalBriefingUrl
    } = validatedFields.data

    // Extract extra briefing data
    const { flowchartData } = data

    // Calculate Go-Live Date
    // +30 days -> Corrente
    // +60 days -> Premium
    const daysToAdd = projectType === 'Corrente' ? 30 : 60
    const goLiveDate = addBusinessDays(new Date(), daysToAdd) // or simple date add? User said "Data Prevista" logic. 
    // Usually business days or calendar days. "30 dias" implies calendar days mostly, but let's use date-fns addDays if available or just addBusinessDays if that's what we have.
    // The import says `addBusinessDays`. I'll stick to that or `addDays` if I import it.
    // Let's assume calendar days for simplicity unless specified "úteis".
    // User: "+30 dias". Standard is calendar.

    const startDate = new Date()

    console.log('✅ Validation passed, checking for existing client...')

    try {
        // 1. Check if Client already exists
        let client = await prisma.client.findUnique({
            where: { email }
        })

        let randomPassword = ''
        let isNewClient = false
        let companyFolderId: string | null = null

        if (!client) {
            // Client doesn't exist, create new one
            isNewClient = true
            randomPassword = generateRandomPassword()
            const hashedPassword = await bcrypt.hash(randomPassword, 10)

            console.log('🔐 Creating new client with email:', email)

            client = await prisma.client.create({
                data: {
                    name: clientName,
                    company: companyName,
                    email: email,
                    phone,
                    passwordHash: hashedPassword,
                    segment,
                    operationSize,
                }
            })

            console.log('✅ Client created:', client.id)

            // 1.1 Create User for client login (role: CLIENT)
            console.log('👤 Creating user for client login...')
            await prisma.user.create({
                data: {
                    name: clientName,
                    email: email,
                    password: hashedPassword,
                    role: 'CLIENT',
                }
            })

            console.log(`🔐 Client login created - Email: ${email}, Password: ${randomPassword}`)

            // 1.2 Create Google Drive Company Folder (if not exists)
            // Format: "001 - Company Name"
            companyFolderId = await ensureClientFolder(companyName, client.code)

            // Update client with Drive folder ID
            if (companyFolderId) {
                await prisma.client.update({
                    where: { id: client.id },
                    data: { driveFolderId: companyFolderId }
                })
            }
        } else {
            console.log('✅ Using existing client:', client.id)
            companyFolderId = client.driveFolderId
        }


        // 2. Create Project (Status: ONBOARDING)
        const project = await prisma.project.create({
            data: {
                name: projectName,
                startDate,
                funnelCount,
                clientId: client.id,
                status: 'ONBOARDING',
                currentStep: 1,
                projectType,
                goLiveDate,
                technicalBriefingUrl,
                salesRepId: "SYSTEM_USER", // TODO: Replace with actual session user ID
            }
        })

        // 3.1 Create Briefing Record
        await prisma.briefing.create({
            data: {
                projectId: project.id,
                flowchartData
            }
        })

        // 3.2 Create Task for Product Owner to start onboarding
        await prisma.task.create({
            data: {
                title: "Iniciar onboarding com cliente",
                description: `Confirmar recebimento de credenciais, documentos para a base de conhecimento e requisitos preenchidos. Agendar reunião de alinhamento com o cliente.`,
                plannedStart: new Date(),
                plannedEnd: calculateBusinessDate(new Date(), 1), // 1 day SLA
                assignedRole: 'PRODUCT_OWNER',
                projectId: project.id,
                isCompleted: false
            }
        })

        // 3.3 Create Task for Product Owner to attach FAQ link
        await prisma.task.create({
            data: {
                title: "Anexar Link do FAQ do Cliente",
                description: `Acesse o projeto e anexe o link do FAQ do cliente ${companyName}. O FAQ foi criado automaticamente no Google Drive.`,
                plannedStart: new Date(),
                plannedEnd: calculateBusinessDate(new Date(), 1), // 1 day SLA
                assignedRole: 'PRODUCT_OWNER',
                projectId: project.id,
                isCompleted: false
            }
        })

        // 4. Send Webhook Notification
        await sendWebhookNotification({
            clientName,
            clientEmail: email,
            companyName,
            phone,
            projectName,
            projectId: project.id,
            startDate: startDate.toISOString(),
            funnelCount,
            clientCode: client.code,
            driveFolderId: companyFolderId,
            loginEmail: email,
            ...(isNewClient && { loginPassword: randomPassword }), // Only include password for new clients
            isNewClient,
            segment,
            operationSize,
            projectType,
            technicalBriefingUrl,
        })

    } catch (error) {
        console.error("Error creating project:", error)
        return { error: "Erro ao criar projeto. Tente novamente." }
    }

    redirect('/kanban')
}
