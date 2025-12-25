'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2, RefreshCw } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateClientCredentials } from './update-credentials-action'

const formSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
})

type Client = {
    id: string
    name: string
    email: string
}

export function EditClientDialog({
    client,
    open,
    onOpenChange,
}: {
    client: Client
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: client.email,
            password: '',
        },
    })

    function generatePassword() {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
        let password = ''
        for (let i = 0; i < 12; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length))
        }
        form.setValue('password', password)
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            // Only send password if it's not empty
            const passwordToSend = values.password && values.password.trim() !== '' ? values.password : undefined

            console.log('Submitting credentials update:', {
                email: values.email,
                hasPassword: !!passwordToSend,
                passwordValue: passwordToSend
            })

            const result = await updateClientCredentials(client.id, values.email, passwordToSend)

            if (result.success) {
                toast.success('Credenciais atualizadas com sucesso!')
                if (passwordToSend) {
                    toast.info(`Nova senha: ${passwordToSend}`, {
                        duration: 10000,
                    })
                }
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Erro ao atualizar credenciais')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Credenciais</DialogTitle>
                    <DialogDescription>
                        Atualize o email e/ou senha de acesso de {client.name}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nova Senha (deixe em branco para não alterar)</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input type="text" placeholder="Digite ou gere uma senha" {...field} />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={generatePassword}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
