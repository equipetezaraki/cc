import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Cleaning up and Re-seeding Stages according to User Rule...')

    // Delete existing templates to avoid mixed 1-10 / 1-7 system
    await prisma.taskTemplate.deleteMany()
    await prisma.stageTemplate.deleteMany()

    const stages = [
        {
            name: 'Onboarding',
            stageNumber: 1,
            kanbanColumn: 'onboarding',
            durationDays: 0,
            tasks: [
                { title: 'Agendar Onboarding', description: 'Agende a reunião de onboarding para gerar o cronograma.', role: 'PRODUCT_OWNER', durationDays: 0 },
                { title: 'Documentar Onboarding por WhatsApp', description: 'Enviar gravação, cronograma e links no grupo.', role: 'PRODUCT_OWNER', durationDays: 0 },
                { title: 'Criar Grupo no WhatsApp', description: 'Criar grupo com cliente e PO.', role: 'CLOSER', durationDays: 0 },
                { title: 'Realizar Briefing com a Equipe', description: 'Briefing técnico de 15 min.', role: 'CLOSER', durationDays: 0 },
                { title: 'Anexar Link do FAQ do Cliente', description: 'O FAQ foi criado no Drive.', role: 'PRODUCT_OWNER', durationDays: 0 }
            ]
        },
        {
            name: 'Definição',
            stageNumber: 2,
            kanbanColumn: 'desenvolvimento',
            durationDays: 2,
            isPerFunnel: false,
            tasks: [
                { title: 'Criar IA Protótipo', description: 'Criar protótipo com info disponível.', role: 'IA', durationDays: 2 },
                { title: 'Criar Fluxograma do CRM', description: 'Fluxograma detalhado do projeto.', role: 'CRM', durationDays: 2 },
                { title: 'Documentar Escopo Fechado', description: 'Criar doc de escopo e solicitar de acordo.', role: 'PRODUCT_OWNER', durationDays: 2 }
            ]
        },
        {
            name: 'Setup',
            stageNumber: 3,
            kanbanColumn: 'desenvolvimento',
            durationDays: 3,
            tasks: []
        },
        {
            name: 'Fluxograma',
            stageNumber: 4,
            kanbanColumn: 'desenvolvimento',
            durationDays: 3,
            tasks: []
        },
        {
            name: 'Go-Live',
            stageNumber: 5,
            kanbanColumn: 'desenvolvimento',
            durationDays: 0,
            tasks: [
                { title: 'Desenvolver Atividades do CRM', description: 'Desenvolver Atividades do CRM.', role: 'CRM', durationDays: 0 },
                { title: 'Desenvolver Atividades da IA', description: 'Desenvolver Atividades da IA.', role: 'IA', durationDays: 0 },
                { title: 'Integrar Dashboard', description: 'Integração do Dashboard (IA + CRM).', role: 'IA', durationDays: 0 },
                { title: 'Rodar Conversation Analytics', description: 'Avaliar a performance da IA.', role: 'IA', durationDays: 0 }
            ]
        },
        {
            name: 'Maturação',
            stageNumber: 6,
            kanbanColumn: 'otimizacao',
            durationDays: 30,
            tasks: []
        },
        {
            name: 'Entrega Final',
            stageNumber: 7,
            kanbanColumn: 'manutencao',
            durationDays: 0,
            tasks: []
        }
    ]

    for (const stage of stages) {
        const createdStage = await prisma.stageTemplate.create({
            data: {
                name: stage.name,
                stageNumber: stage.stageNumber,
                kanbanColumn: stage.kanbanColumn,
                durationDays: stage.durationDays,
                isPerFunnel: (stage as any).isPerFunnel || false
            }
        })

        console.log(`✅ Stage ${stage.stageNumber}: ${createdStage.name} (${stage.durationDays} days) -> ${stage.kanbanColumn}`)

        for (const task of stage.tasks) {
            await prisma.taskTemplate.create({
                data: {
                    title: task.title,
                    description: task.description,
                    role: task.role as any,
                    durationDays: (task as any).durationDays || 0,
                    stageTemplateId: createdStage.id
                }
            })
        }
    }

    console.log('✨ All templates synced with User Rules!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
