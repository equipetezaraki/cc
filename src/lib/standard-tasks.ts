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
    // --- ETAPA 1: Onboarding (Data da Reunião) ---
    {
        stage: 1,
        role: 'PRODUCT_OWNER',
        title: "Agendar Onboarding",
        description: "O briefing foi enviado. Agende a reunião de onboarding para gerar o cronograma completo do projeto.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 1,
        role: 'PRODUCT_OWNER',
        title: "Documentar Onboarding por WhatsApp",
        description: "Enviar no grupo do WhatsApp a gravação do onboarding, cronograma, link do drive na descrição, acesso ao Tezaraki OS do cliente na descrição.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 1,
        role: 'CLOSER',
        title: "Criar Grupo no WhatsApp",
        description: "Criar grupo no WhatsApp com cliente e inserir o Product Owner",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 1,
        role: 'CLOSER',
        title: "Realizar Briefing com a Equipe",
        description: "Realizar briefing técnico de 15 minutos com equipe responsável pelo projeto",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 1,
        role: 'PRODUCT_OWNER',
        title: "Anexar Link do FAQ do Cliente",
        description: "Acesse o projeto e anexe o link do FAQ do cliente. O FAQ foi criado automaticamente no Google Drive.",
        type: 'DELIVERY',
        relativeDays: 0
    },

    // --- ETAPA 2: Definição (Onboarding + 2 dias úteis) ---
    {
        stage: 2,
        role: 'IA',
        title: "Criar IA Protótipo",
        description: "Criar IA protótipo com informações disponíveis da empresa, para o propósito acordado",
        type: 'DELIVERY',
        relativeDays: 2
    },
    {
        stage: 2,
        role: 'CRM',
        title: "Criar Fluxograma do CRM",
        description: "Criar Fluxograma detalhado do projeto de CRM da empresa",
        type: 'DELIVERY',
        relativeDays: 2
    },
    {
        stage: 2,
        role: 'PRODUCT_OWNER',
        title: "Documentar Escopo Fechado",
        description: "Criar um documento no Google Docs do cliente, salvar em PDF e anexar em um email solicitando uma resposta de 'De acordo com o escopo'.",
        type: 'DELIVERY',
        relativeDays: 2
    },

    // --- ETAPA 5: Go-Live (Data do Go-live) ---
    {
        stage: 5,
        role: 'CRM',
        title: "Desenvolver Atividades do CRM",
        description: "Desenvolver Atividades do CRM",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'IA',
        title: "Desenvolver Atividades da IA",
        description: "Desenvolver Atividades da IA",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'IA',
        title: "Integrar Dashboard",
        description: "Integração do Dashboard (IA + CRM)",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'IA',
        title: "Rodar Conversation Analytics",
        description: "Rodar o Conversation Analytics e Avaliar a performance da IA",
        type: 'DELIVERY',
        relativeDays: 0
    },
]
