'use client'

import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ExternalLink, Save, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { saveClientOnboardingData, submitClientOnboarding } from "@/app/(main)/client/actions"
import { toast } from "sonner"

const clientOnboardingSchema = z.object({
    openAiKey: z.string().min(1, "API Key da OpenAI é obrigatória"),
    openRouterKey: z.string().min(1, "API Key da OpenRouter é obrigatória"),
})
type ClientOnboardingValues = z.infer<typeof clientOnboardingSchema>

interface ClientOnboardingProps {
    projectId: string
    faqLink: string | null
    initialData?: {
        openAiKey?: string | null
        openRouterKey?: string | null
        faqConfirmed?: boolean
        speakingStyleConfirmed?: boolean
    }
    hasPendingOnboardingTask?: boolean
}

export function ClientOnboarding({ projectId, faqLink, initialData, hasPendingOnboardingTask = false }: ClientOnboardingProps) {
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(hasPendingOnboardingTask)

    const form = useForm<ClientOnboardingValues>({
        resolver: zodResolver(clientOnboardingSchema),
        defaultValues: {
            openAiKey: initialData?.openAiKey || "",
            openRouterKey: initialData?.openRouterKey || "",
        },
    })

    const handleSavePartial = async () => {
        const values = form.getValues()
        startTransition(async () => {
            const result = await saveClientOnboardingData(projectId, {
                openAiKey: values.openAiKey,
                openRouterKey: values.openRouterKey,
            })
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Dados salvos com sucesso!")
            }
        })
    }

    const onSubmit = (data: ClientOnboardingValues) => {
        startTransition(async () => {
            const result = await submitClientOnboarding(projectId, {
                ...data,
                faqConfirmed: true // Automatically confirm on submission
            })
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Onboarding concluído! Aguarde o contato para agendamento.")
                setIsSuccess(true)
            }
        })
    }

    if (isSuccess) {
        return (
            <Card className="w-full max-w-2xl mx-auto mt-10 text-center py-10">
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl">Tudo pronto por aqui!</CardTitle>
                        <CardDescription className="text-base max-w-md mx-auto">
                            Recebemos suas informações com sucesso. Nossa equipe já foi notificada e entrará em contato em breve para agendar a apresentação dos esboços.
                        </CardDescription>
                    </div>
                    <div className="pt-4 flex flex-col items-center gap-4">
                        {faqLink && (
                            <a
                                href={faqLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center text-sm font-medium"
                            >
                                Acessar FAQ do Projeto <ExternalLink className="ml-1 h-4 w-4" />
                            </a>
                        )}
                        <Button variant="outline" disabled>
                            Aguardando Agendamento
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto mt-10">
            <CardHeader>
                <CardTitle>Bem-vindo ao Tezaraki OS</CardTitle>
                <CardDescription>
                    Para iniciarmos o desenvolvimento da sua IA, precisamos de algumas informações essenciais.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* FAQ Link from Product Owner - Moved to Top */}
                        {!!faqLink && (
                            <div className="p-6 border-2 border-primary/20 rounded-xl bg-primary/5 space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ExternalLink className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
                                </div>
                                <div className="flex items-start space-x-4 relative z-10">
                                    <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                                        <ExternalLink className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-primary">FAQ do Seu Projeto</h4>
                                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                            Preparamos um FAQ personalizado com todas as diretrizes, prazos e informações essenciais para o sucesso da sua IA.
                                        </p>
                                        <a
                                            href={faqLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                        >
                                            Abrir FAQ Agora <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="openAiKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OpenAI API Key</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="sk-..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Sua chave de API da OpenAI para processamento de linguagem.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="openRouterKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OpenRouter API Key</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="sk-or-..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Sua chave de API da OpenRouter para modelos alternativos.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        <div className="flex justify-between pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSavePartial}
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar Parcialmente
                            </Button>

                            <Button type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Enviar e Iniciar
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
