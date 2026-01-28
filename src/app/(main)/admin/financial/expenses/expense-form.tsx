"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createExpense, updateExpense } from "./actions"
import { ExpenseType } from "@prisma/client"
import { toast } from "sonner"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const expenseSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.string().min(1, "Valor é obrigatório").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Valor deve ser maior que zero"),
    type: z.enum(["RECURRING", "ONE_TIME"]),
    category: z.string().optional(),
    date: z.date({
        required_error: "A data é obrigatória",
    }),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
    expense?: {
        id: string
        description: string
        amount: number
        type: ExpenseType
        category: string | null
        date: Date
    }
}

export function ExpenseForm({ expense }: ExpenseFormProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            description: expense?.description || "",
            amount: expense?.amount.toString() as any || "",
            type: expense?.type || "ONE_TIME",
            category: expense?.category || "",
            date: expense?.date ? new Date(expense.date) : new Date(),
        },
    })

    async function onSubmit(values: ExpenseFormValues) {
        setLoading(true)
        try {
            const data = {
                ...values,
                amount: parseFloat(values.amount),
                category: values.category || undefined,
            }
            if (expense) {
                const result = await updateExpense(expense.id, data)
                if (result.success) {
                    toast.success("Despesa atualizada com sucesso")
                } else {
                    toast.error(result.error)
                }
            } else {
                const result = await createExpense(data)
                if (result.success) {
                    toast.success("Despesa criada com sucesso")
                    form.reset()
                } else {
                    toast.error(result.error)
                }
            }
        } catch (error) {
            toast.error("Ocorreu um erro inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: HubSpot, Servidor Cloud" {...field} className="bg-white/5 border-white/10" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="0,00" {...field} className="bg-white/5 border-white/10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-900 border-white/10">
                                        <SelectItem value="RECURRING">Recorrente</SelectItem>
                                        <SelectItem value="ONE_TIME">Pontual</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Data</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-white/5 border-white/10",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: ptBR })
                                                ) : (
                                                    <span>Selecione a data</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-white/10" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Software, Marketing" {...field} className="bg-white/5 border-white/10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {expense ? "Salvar Alterações" : "Criar Despesa"}
                </Button>
            </form>
        </Form>
    )
}
