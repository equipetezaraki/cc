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
    faqConfirmed: z.boolean().refine(val => val === true, "Você deve confirmar o preenchimento do FAQ e o acordo com o desenvolvimento"),
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
            faqConfirmed: initialData?.faqConfirmed || false,
        },
    })

    const handleSavePartial = async () => {
        const values = form.getValues()
        startTransition(async () => {
            const result = await saveClientOnboardingData(projectId, {
                openAiKey: values.openAiKey,
                openRouterKey: values.openRouterKey,
                faqConfirmed: values.faqConfirmed,
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
            const result = await submitClientOnboarding(projectId, data)
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
                    <div className="pt-4">
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

                        {/* FAQ Link from Product Owner */}
                        {faqLink && (
                            <div className="p-4 border rounded-lg bg-primary/5 space-y-2">
                                <div className="flex items-start space-x-2">
                                    <div className="mt-1">
                                        <ExternalLink className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">FAQ do Cliente</h4>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Acesse o FAQ preparado especialmente para você:
                                        </p>
                                        <a
                                            href={faqLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline inline-flex items-center text-sm font-medium"
                                        >
                                            Abrir FAQ <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FAQ Confirmation Checkbox */}
                        {!faqLink && (
                            <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">FAQ Indisponível</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>O link do FAQ ainda não foi disponibilizado. Entre em contato com o suporte para prosseguir.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="faqConfirmed"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!faqLink}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className={!faqLink ? "text-muted-foreground" : ""}>
                                            Declaro que preenchi o FAQ e estou de acordo com o desenvolvimento do projeto com as informações atuais
                                        </FormLabel>
                                        <FormDescription>
                                            Confirmo o preenchimento e aceito os termos para início do desenvolvimento.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Speaking Style Confirmation Item */}
                        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background mt-6">
                            <Checkbox
                                checked={initialData?.speakingStyleConfirmed}
                                disabled
                                id="speaking-style"
                            />
                            <div className="space-y-1 leading-none">
                                <label
                                    htmlFor="speaking-style"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Definição de Estilo de Fala
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    Converse com o TZK no WhatsApp para definir o estilo de fala da sua IA.
                                    Este item será marcado automaticamente após a conclusão.
                                    <br />
                                    <span className="text-xs italic">Em caso de dúvidas, contate o suporte.</span>
                                </p>
                            </div>
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

                            <Button type="submit" disabled={isPending || !initialData?.speakingStyleConfirmed}>
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
