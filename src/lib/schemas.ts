import { z } from "zod"

export const onboardingSchema = z.object({
    clientName: z.string().min(2, "Nome do cliente é obrigatório"),
    phone: z.string().regex(/^55\d{2}\d{9}$/, "Formato inválido. Use: 55 + DDD + Número (ex: 5527999492205)"),
    companyName: z.string().min(2, "Nome da empresa é obrigatório"),
    startDate: z.date({ required_error: "Data de início é obrigatória" }),
    funnelCount: z.number().min(1, "Mínimo de 1 funil").max(10, "Máximo de 10 funis"),
    projectName: z.string().min(2, "Nome do projeto é obrigatório").max(40, "Nome do projeto deve ter no máximo 40 caracteres"),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
