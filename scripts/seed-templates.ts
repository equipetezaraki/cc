
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Templates...')

    // Clear existing templates to avoid duplicates (optional, strictly for development/reset)
    // await prisma.taskTemplate.deleteMany()
    // await prisma.stageTemplate.deleteMany()

    const stages = [
        {
            name: 'Onboarding',
            stageNumber: 1,
            kanbanColumn: 'onboarding',
            tasks: [] // No tasks, just a checkbox stage
        },
        {
            name: 'Validação de Esboços',
            stageNumber: 2,
            kanbanColumn: 'step-2',
            tasks: [
                { title: 'Apresentar Esboços', description: 'Reunião para apresentar a voz e as automações.', role: 'PRODUCT_OWNER' },
                { title: 'Aprovar Esboços', description: 'Cliente deve aprovar os esboços apresentados.', role: 'CLIENT' } // Example
            ]
        },
        {
            name: 'Setup & Automações',
            stageNumber: 3,
            kanbanColumn: 'step-3',
            tasks: [
                { title: 'Configurar Ambiente', description: 'Preparar ambiente de desenvolvimento.', role: 'IA' },
                { title: 'Integração CRM', description: 'Conectar com o CRM do cliente.', role: 'CRM' }
            ]
        },
        {
            name: 'Desenvolvimento Comportamento',
            stageNumber: 4,
            kanbanColumn: 'step-4',
            tasks: [
                { title: 'Treinamento IA', description: 'Ajustar prompts e respostas.', role: 'IA' },
                { title: 'Testes Internos', description: 'Validar fluxos de conversação.', role: 'IA' }
            ]
        },
        {
            name: 'Go-Live',
            stageNumber: 5,
            kanbanColumn: 'step-5',
            tasks: [
                { title: 'Virada de Chave', description: 'Ativar a IA em produção.', role: 'PRODUCT_OWNER' },
                { title: 'Monitoramento Inicial', description: 'Acompanhar primeiras horas.', role: 'IA' }
            ]
        },
        {
            name: 'Maturação',
            stageNumber: 6,
            kanbanColumn: 'step-6',
            tasks: [
                { title: 'Análise de Conversas', description: 'Revisar logs e ajustar.', role: 'IA' },
                { title: 'Relatório Mensal', description: 'Gerar relatório de performance.', role: 'PRODUCT_OWNER' }
            ]
        },
        {
            name: 'Entrega Final',
            stageNumber: 7,
            kanbanColumn: 'step-7',
            tasks: [
                { title: 'Reunião de Encerramento', description: 'Entregar projeto e colher feedback.', role: 'PRODUCT_OWNER' }
            ]
        }
    ]

    for (const stage of stages) {
        const createdStage = await prisma.stageTemplate.upsert({
            where: { stageNumber: stage.stageNumber },
            update: {
                name: stage.name,
                kanbanColumn: stage.kanbanColumn
            },
            create: {
                name: stage.name,
                stageNumber: stage.stageNumber,
                kanbanColumn: stage.kanbanColumn
            }
        })

        console.log(`Upserted Stage: ${createdStage.name}`)

        for (const task of stage.tasks) {
            // For simplicity in seeding, we just create. In a real generalized seed, we might query first.
            // But since we want to ensure these specific tasks exist for this stage:

            // We can't easy upsert tasks without a unique identifier other than ID. 
            // Let's check if a task with this title exists for this stage Template.
            const existingTask = await prisma.taskTemplate.findFirst({
                where: {
                    stageTemplateId: createdStage.id,
                    title: task.title
                }
            })

            if (!existingTask) {
                await prisma.taskTemplate.create({
                    data: {
                        title: task.title,
                        description: task.description,
                        role: task.role as any,
                        stageTemplateId: createdStage.id
                    }
                })
                console.log(`  Created Task: ${task.title}`)
            } else {
                console.log(`  Task already exists: ${task.title}`)
            }
        }
    }

    console.log('Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
