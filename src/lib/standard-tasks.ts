import { Role } from "@prisma/client"

export type StandardTask = {
    stage: number
    role: Role
    title: string
    description?: string
    type: 'DELIVERY' | 'MEETING_OUTPUT'
    relativeDays: number // Days relative to previous stage or start
}

export const STANDARD_TASKS: StandardTask[] = [
    // --- MARCO ZERO (d0) ---
    // Product Owner
    {
        stage: 0,
        role: 'PRODUCT_OWNER',
        title: "Confirmar recebimento de credenciais e requisitos",
        description: "Confirmar recebimento de credenciais, whatsapp integrado (cobrar e auxiliar), documentos para a base de conhecimento e requisitos preenchidos. Agendar reunião de alinhamento com o cliente.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 0,
        role: 'PRODUCT_OWNER',
        title: "Iniciar onboarding no grupo oficial",
        description: "Iniciar onboarding no grupo oficial do Whatsapp; Definir cronograma oficial com datas agendadas; Enviar ao cliente resumo do cronograma e próximos passos.",
        type: 'MEETING_OUTPUT',
        relativeDays: 0
    },
    // IA
    {
        stage: 0,
        role: 'IA',
        title: "Aguardar documentos e integrações",
        description: "Aguardar documentos, integração com whatsapp e base de conhecimento para início das configurações.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    // CRM
    {
        stage: 0,
        role: 'CRM',
        title: "Aguardar confirmação da plataforma",
        description: "Aguardar confirmação da plataforma e acessos de integração.",
        type: 'DELIVERY',
        relativeDays: 0
    },

    // --- ETAPA 1: Reunião de Alinhamento (+2 dias) ---
    // Product Owner
    {
        stage: 1,
        role: 'PRODUCT_OWNER',
        title: "Conduzir reunião de alinhamento",
        description: "Conduzir reunião (1h por funil) e registrar decisões; Garantir que todos os requisitos estejam alinhados.",
        type: 'DELIVERY',
        relativeDays: 2
    },
    {
        stage: 1,
        role: 'PRODUCT_OWNER',
        title: "Enviar ata da reunião",
        description: "Enviar ata da reunião com resumo de decisões e prazos; Confirmar escopo e próximas entregas com as equipes técnicas.",
        type: 'MEETING_OUTPUT',
        relativeDays: 2
    },
    // IA
    {
        stage: 1,
        role: 'IA',
        title: "Levantar diretrizes da IA",
        description: "Levantar, questionar e registrar diretrizes de fala, público e objetivos da IA em cada funil que será desenvolvido; Levantar dúvidas técnicas sobre fluxos e comportamento esperado.",
        type: 'DELIVERY',
        relativeDays: 2
    },
    // CRM
    {
        stage: 1,
        role: 'CRM',
        title: "Mapear etapas do atendimento",
        description: "Mapear etapas do atendimento atual e esperado; Registrar estrutura inicial de funis e movimentações.",
        type: 'DELIVERY',
        relativeDays: 2
    },
    {
        stage: 1,
        role: 'CRM',
        title: "Criar esboço dos funis no Miro",
        description: "Criar esboço dos funis no Miro conforme orientação da reunião; Documentar regras de movimentações discutidas na reunião.",
        type: 'MEETING_OUTPUT',
        relativeDays: 2
    },

    // --- ETAPA 2: Apresentação de Esboços (+3 dias) ---
    // Product Owner
    {
        stage: 2,
        role: 'PRODUCT_OWNER',
        title: "Conduzir reunião de validação",
        description: "Conduzir reunião de validação e registrar todas as decisões; Garantir clareza nas alterações e próximos passos; Alinhar prazos e formalizações com o cliente.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 2,
        role: 'PRODUCT_OWNER',
        title: "Formalizar decisões",
        description: "Formalizar decisões e confirmar início da fase de desenvolvimento; Garantir que o cliente compreenda o cronograma e responsabilidades; Disponibilizar ambiente para anotações e feedbacks.",
        type: 'MEETING_OUTPUT',
        relativeDays: 3
    },
    // IA
    {
        stage: 2,
        role: 'IA',
        title: "Apresentar esboço inicial da IA",
        description: "Apresentar esboço inicial da IA; Fornecer link em ambiente de testes.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 2,
        role: 'IA',
        title: "Criar versão 0 (protótipo)",
        description: "Criar versão 0 (protótipo) da IA conversacional; Integrar base de conhecimentos na versão 0 da IA; Estruturar o estilo de fala no v0 da IA conforme orientado em reunião.",
        type: 'MEETING_OUTPUT',
        relativeDays: 3
    },
    // CRM
    {
        stage: 2,
        role: 'CRM',
        title: "Apresentar funis e etapas",
        description: "Apresentar funis e etapas desenhadas no Miro; Validar estrutura macro e critérios de movimentações entre etapas.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 2,
        role: 'CRM',
        title: "Disponibilizar funis no Miro atualizado",
        description: "Disponibilizar funis no Miro atualizado com versão final validada por ambas as partes; Implementar funis e etapas validadas na plataforma.",
        type: 'MEETING_OUTPUT',
        relativeDays: 3
    },

    // --- ETAPA 3: Estrutura Base (+3 dias/funil) ---
    // Product Owner
    {
        stage: 3,
        role: 'PRODUCT_OWNER',
        title: "Reunir equipes técnicas",
        description: "Reunir equipes técnicas para revisar pendências e prazos; Alinhar cronograma interno e responsabilidades; Apoio técnico na integração de APIs; Atualizar Rodrigo e Merçon sobre o andamento.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 3,
        role: 'PRODUCT_OWNER',
        title: "Garantir cumprimento de prazos",
        description: "Garantir o cumprimento de prazos; Consolidar feedbacks do v0 da IA; Garantir que todos os ajustes realizados no v0 da IA sejam documentados.",
        type: 'MEETING_OUTPUT',
        relativeDays: 3
    },
    // IA
    {
        stage: 3,
        role: 'IA',
        title: "Criar workflows e integrar",
        description: "Criar workflows das IAs conversacionais no ambiente de teste; Integrar bancos de dados; Integrar API do CRM ou outra plataforma que utilizar; Ajustar feedbacks recebidos do esboço da IA.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 3,
        role: 'IA',
        title: "Refinar versão 0 da IA",
        description: "Refinar ao longo de 14 dias a versão 0 conforme feedbacks da reunião e pós reunião; Disponibilizar link interno da IA para testes e coleta de feedbacks; Preparar ambiente formal para edição do FAQ.",
        type: 'MEETING_OUTPUT',
        relativeDays: 3
    },
    // CRM
    {
        stage: 3,
        role: 'CRM',
        title: "Criar funis e automações no CRM",
        description: "Criar funis e etapas na plataforma de CRM; Criar copys de repescagem e carrinhos abandonados; Conectar webhooks necessários.",
        type: 'DELIVERY',
        relativeDays: 3
    },
    {
        stage: 3,
        role: 'CRM',
        title: "Apresentar status dos funis",
        description: "Apresentar status dos funis e automações criadas.",
        type: 'MEETING_OUTPUT',
        relativeDays: 3
    },

    // --- ETAPA 4: Desenvolvimento e Testes (+1 dia) ---
    // Product Owner
    {
        stage: 4,
        role: 'PRODUCT_OWNER',
        title: "Verificar andamento das entregas",
        description: "Verificar andamento das entregas de cada funil; Validar se as regras específicas estão alinhadas ao escopo.",
        type: 'DELIVERY',
        relativeDays: 1
    },
    {
        stage: 4,
        role: 'PRODUCT_OWNER',
        title: "Supervisionar testes",
        description: "Supervisionar e acompanhar testes; Consolidar feedbacks do v0 da IA; Garantir que todos os ajustes realizados no v0 da IA sejam documentados.",
        type: 'MEETING_OUTPUT',
        relativeDays: 1
    },
    // IA
    {
        stage: 4,
        role: 'IA',
        title: "Desenvolver IAs conversacionais e tools",
        description: "Desenvolver IAs conversacionais, comportamentos, tools e ações específicas da IA de cada funil; Testar TUDO dezenas de vezes em múltiplos cenários diferentes; Desenvolver IA observadora para coletar dados; Desenvolver lógica de encaminhamento para humano.",
        type: 'DELIVERY',
        relativeDays: 1
    },
    {
        stage: 4,
        role: 'IA',
        title: "Apresentar progresso da automação",
        description: "Apresentar progresso da automação.",
        type: 'MEETING_OUTPUT',
        relativeDays: 1
    },
    // CRM
    {
        stage: 4,
        role: 'CRM',
        title: "Criar workflows de repescagem",
        description: "Criar workflows das repescagens; Criar workflows de outros gatilhos (compra aprovada, carrinho abandonado...); Desenvolver IAs de movimentações automáticas. Testar TUDO dezenas de vezes.",
        type: 'DELIVERY',
        relativeDays: 1
    },
    {
        stage: 4,
        role: 'CRM',
        title: "Demonstrar automações",
        description: "Demonstrar pro Product Owner automações de repescagem e movimentações automáticas implementadas.",
        type: 'MEETING_OUTPUT',
        relativeDays: 1
    },

    // --- ETAPA 5: Produção (+30 dias) ---
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
        title: "Subir workflows para produção",
        description: "Atualizar links de teste para links oficiais; Subir workflows criados e credenciais para o servidor de produção; Validar funcionalidade dos workflows no servidor de produção.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'IA',
        title: "Demonstrar funis implementados",
        description: "Demonstrar pro Product Owner funis específicos implementados; Apresentar avanços no refinamento do v0 da IA conversacional.",
        type: 'MEETING_OUTPUT',
        relativeDays: 0
    },
    // CRM
    {
        stage: 5,
        role: 'CRM',
        title: "Subir workflows CRM para produção",
        description: "Atualizar links de teste para links oficiais; Subir workflows criados e credenciais para o servidor de produção; Validar funcionalidade dos workflows no servidor de produção.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 5,
        role: 'CRM',
        title: "Garantir funcionamento contínuo",
        description: "Garantir funcionamento contínuo das automações implementadas.",
        type: 'MEETING_OUTPUT',
        relativeDays: 0
    },

    // --- ETAPA 6: Rodando com Público Real ---
    // Product Owner
    {
        stage: 6,
        role: 'PRODUCT_OWNER',
        title: "Coletar feedbacks semanais",
        description: "Coletar feedbacks semanais e repassar para a equipe técnica.",
        type: 'DELIVERY',
        relativeDays: 7 // Weekly
    },
    {
        stage: 6,
        role: 'PRODUCT_OWNER',
        title: "Formalizar alterações",
        description: "Formalizar alterações realizadas e comunicar cliente; Supervisionar execução dos ajustes.",
        type: 'MEETING_OUTPUT',
        relativeDays: 0
    },
    // IA
    {
        stage: 6,
        role: 'IA',
        title: "Realizar ajustes solicitados",
        description: "Realizar ajustes solicitados pelo Product Owner.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 6,
        role: 'IA',
        title: "Garantir funcionamento contínuo (IA)",
        description: "Garantir funcionamento contínuo das automações implementadas.",
        type: 'MEETING_OUTPUT',
        relativeDays: 0
    },
    // CRM
    {
        stage: 6,
        role: 'CRM',
        title: "Realizar ajustes solicitados (CRM)",
        description: "Realizar ajustes solicitados pelo Product Owner.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    {
        stage: 6,
        role: 'CRM',
        title: "Garantir funcionamento contínuo (CRM)",
        description: "Garantir funcionamento contínuo das automações implementadas.",
        type: 'MEETING_OUTPUT',
        relativeDays: 0
    },

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
    // IA
    {
        stage: 7,
        role: 'IA',
        title: "Documentar versão final (IA)",
        description: "Documentar versão final da automação.",
        type: 'DELIVERY',
        relativeDays: 0
    },
    // CRM
    {
        stage: 7,
        role: 'CRM',
        title: "Documentar versão final (CRM)",
        description: "Documentar versão final da automação.",
        type: 'DELIVERY',
        relativeDays: 0
    },
]
