import { z } from "zod"

export const onboardingSchema = z.object({
    clientName: z.string().min(2, "Nome do cliente é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().regex(/^\d{10,13}$/, "Formato inválido. Apenas números (ex: 5527999492205)"),
    companyName: z.string().min(2, "Nome da empresa é obrigatório"),
    funnelCount: z.number().min(1, "Mínimo de 1 funil").max(10, "Máximo de 10 funis"),
    projectName: z.string().min(2, "Nome do projeto é obrigatório").max(40, "Nome do projeto deve ter no máximo 40 caracteres"),

    // New Fields
    segment: z.string().min(1, "Segmento é obrigatório"),
    operationSize: z.string().min(1, "Tamanho da operação é obrigatório"),
    projectType: z.string().min(1, "Tipo de projeto é obrigatório"),
    technicalBriefingUrl: z.string().url("URL do Google Docs inválida").optional().or(z.literal("")),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
