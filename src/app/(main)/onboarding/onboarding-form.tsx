'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { onboardingSchema, OnboardingFormValues } from "@/lib/schemas"
import { submitOnboarding } from "./actions"

export function OnboardingForm() {
    const [isPending, startTransition] = useTransition()

    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema) as any,
        defaultValues: {
            clientName: "",
            companyName: "",
            phone: "",
            projectName: "",
            funnelCount: 1,
        },
    })

    function onSubmit(data: OnboardingFormValues) {
        startTransition(async () => {
            const result = await submitOnboarding(data)
            if (result?.error) {
                alert(result.error)
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Dados do Cliente</h3>

                        <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Cliente</FormLabel>
                                    <FormControl>
                                        <Input placeholder="João Silva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefone (55 + DDD + Número)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="5511999999999" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Apenas números. Ex: 5527999492205
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Empresa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Inc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Project Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Dados do Projeto</h3>

                        <FormField
                            control={form.control}
                            name="projectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Projeto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Implementação CRM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Data Zero (Início)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Data de início oficial do projeto.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="funnelCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantidade de Funis</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} max={10} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormDescription>
                                        Número de funis contratados.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Criando Projeto..." : "Iniciar Projeto"}
                </Button>
            </form>
        </Form>
    )
}

