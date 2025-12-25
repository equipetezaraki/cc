import { Role } from "@prisma/client"

export type StandardTask = {
    stage: number
    role: Role
    title: string
    description?: string
    type: 'DELIVERY' | 'MEETING_OUTPUT'
    relativeDays: number // Days relative to previous stage or start
    perFunnel?: boolean
}

export const STANDARD_TASKS: StandardTask[] = [
    // --- ETAPA 1: Onboarding ---
    // Product Owner - SEM TAREFAS
    // IA - SEM TAREFAS
    // CRM - SEM TAREFAS

    // --- ETAPA 2: Validação de Esboços ---
    // Product Owner
    {
        stage: 2,
        role: 'PRODUCT_OWNER',
        title: "Conduzir reunião de alinhamento",
        description: "Conduzir reunião (1h por funil) e registrar decisões; Garantir que todos os requisitos estejam alinhados.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 2,
        role: 'PRODUCT_OWNER',
        title: "Enviar ata da reunião",
        description: "Enviar ata da reunião com resumo de decisões e prazos; Confirmar escopo e próximas entregas com as equipes técnicas.",
        type: 'MEETING_OUTPUT',
        relativeDays: 3
    },
    // IA
    {
        stage: 2,
        role: 'IA',
        title: "Criar e apresentar esboço da IA",
        description: "Criar e apresentar o esboço da IA com base de conhecimento integrada no FAQ do cliente, contexto do negócio adequado e estilo de fala de acordo com o proposto no onboarding.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    // CRM
    {
        stage: 2,
        role: 'CRM',
        title: "Criar e apresentar fluxograma",
        description: "Criar e apresentar fluxograma de esboço dos funis e objetivos da IA.",
        type: 'DELIVERY',
        relativeDays: 0
    },

    // --- ETAPA 3: Setup & Automações (+3 dias) ---
    // Product Owner
    {
        stage: 3,
        role: 'PRODUCT_OWNER',
        title: "Garantir cumprimento de prazos",
        description: "Garantir o cumprimento de prazos; Consolidar feedbacks do v0 da IA; Garantir que todos os ajustes realizados no v0 da IA sejam documentados.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    // IA
    {
        stage: 3,
        role: 'IA',
        title: "Criar workflows de teste",
        description: "Criar workflows das IAs conversacionais no ambiente de teste.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 3,
        role: 'IA',
        title: "Integrar bancos de dados",
        description: "Integrar bancos de dados.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 3,
        role: 'IA',
        title: "Integrar APIs",
        description: "Integrar API do CRM ou outra plataforma que utilizar.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    // CRM
    {
        stage: 3,
        role: 'CRM',
        title: "Criar funis no CRM",
        description: "Criar funis e etapas na plataforma de CRM.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 3,
        role: 'CRM',
        title: "Criar copies de repescagem",
        description: "Criar/validar copies de repescagem e carrinhos abandonados.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 3,
        role: 'CRM',
        title: "Conectar webhooks",
        description: "Conectar webhooks necessários (carrinhos abandonados, compra aprovada... e outros que tiverem).",
        type: 'DELIVERY',
        relativeDays: 3
    },

    // --- ETAPA 4: Desenvolvimento de Funis (+3 dias/funil) ---
    // Product Owner
    {
        stage: 4,
        role: 'PRODUCT_OWNER',
        title: "Verificar andamento das entregas",
        description: "Verificar andamento das entregas de cada funil; Validar se as regras específicas estão alinhadas ao escopo.",
        type: 'DELIVERY',
        relativeDays: 1
    },
    // IA (Per Funnel)
    {
        stage: 4,
        role: 'IA',
        title: "Desenvolver IAs conversacionais",
        description: "Desenvolver IAs conversacionais, comportamentos, tools e ações específicas da IA de cada funil.",
        type: 'DELIVERY',
        relativeDays: 3,
        perFunnel: true
    },
    {
        stage: 4,
        role: 'IA',
        title: "Desenvolver IAs auxiliares",
        description: "Desenvolver IAs auxiliares para coletar dados e movimentar entre etapas do funil.",
        type: 'DELIVERY',
        relativeDays: 3,
        perFunnel: true
    },
    {
        stage: 4,
        role: 'IA',
        title: "Desenvolver lógica de encaminhamento",
        description: "Desenvolver lógica de encaminhamento para humano.",
        type: 'DELIVERY',
        relativeDays: 3,
        perFunnel: true
    },
    // CRM (Per Funnel)
    {
        stage: 4,
        role: 'CRM',
        title: "Criar workflows de repescagem",
        description: "Criar workflows das repescagens.",
        type: 'DELIVERY',
        relativeDays: 3,
        perFunnel: true
    },
    {
        stage: 4,
        role: 'CRM',
        title: "Criar workflows de gatilhos",
        description: "Criar workflows de outros gatilhos (compra aprovada, carrinho abandonado...).",
        type: 'DELIVERY',
        relativeDays: 3,
        perFunnel: true
    },
    {
        stage: 4,
        role: 'CRM',
        title: "Criar automações de movimentação",
        description: "Criar automações de movimentação e repescagem no CRM.",
        type: 'DELIVERY',
        relativeDays: 3,
        perFunnel: true
    },

    // --- ETAPA 5: Go-Live ---
    // Product Owner
    {
        stage: 5,
        role: 'PRODUCT_OWNER',
        title: "Validar entregas para produção",
        description: "Validar que todas as entregas estão prontas para produção; Confirmar checklist final com cliente e equipes.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'PRODUCT_OWNER',
        title: "Autorizar início da operação",
        description: "Autorizar início da operação com público real; Reforçar cronograma oficial de entrada em produção e ciclos de feedbacks.",
        type: 'MEETING_OUTPUT',
        relativeDays: 0
    },
    // IA
    {
        stage: 5,
        role: 'IA',
        title: "Atualizar links",
        description: "Atualizar links de teste para links oficiais.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'IA',
        title: "Subir workflows para produção",
        description: "Subir workflows criados e credenciais para o servidor de produção.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'IA',
        title: "Validar workflows em produção",
        description: "Validar funcionalidade dos workflows no servidor de produção.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    // CRM
    {
        stage: 5,
        role: 'CRM',
        title: "Atualizar links (CRM)",
        description: "Atualizar links de teste para links oficiais.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'CRM',
        title: "Subir workflows para produção (CRM)",
        description: "Subir workflows criados e credenciais para o servidor de produção.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'CRM',
        title: "Validar workflows em produção (CRM)",
        description: "Validar funcionalidade dos workflows no servidor de produção.",
        type: 'DELIVERY',
        relativeDays: 0
    },

    // --- ETAPA 6: Maturação ---
    // Product Owner
    {
        stage: 6,
        role: 'PRODUCT_OWNER',
        title: "Coletar feedbacks semanais",
        description: "Coletar feedbacks semanais e repassar para a equipe técnica.",
        type: 'DELIVERY',
        relativeDays: 7 // Weekly
    },
    // IA - SEM TAREFAS
    // CRM - SEM TAREFAS

    // --- ETAPA 7: Entrega Final ---
    // Product Owner
    {
        stage: 7,
        role: 'PRODUCT_OWNER',
        title: "Conduzir reunião de encerramento",
        description: "Conduzir reunião de encerramento com cliente e equipe; Apresentar resultados e métricas consolidadas.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    // IA - SEM TAREFAS
    // CRM - SEM TAREFAS
]
