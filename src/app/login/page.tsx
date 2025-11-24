'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authenticate } from './actions'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(5, "Senha deve ter no mínimo 5 caracteres"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [isPending, startTransition] = useTransition()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(data: LoginFormValues) {
        startTransition(async () => {
            const result = await authenticate(data)
            if (result?.error) {
                form.setError("root", { message: result.error })
            }
        })
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="relative w-48 h-16 mb-4">
                        <Image
                            src="https://pub-0d7f337b40f945f39835d82c45c31e19.r2.dev/Nome%20-%20Transparente.webp"
                            alt="Tezaraki OS"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <Image
                            src="https://pub-0d7f337b40f945f39835d82c45c31e19.r2.dev/872bc191-448c-4ffc-b8f8-411139139116.webp"
                            alt="Tezaraki OS"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </div>
                    <CardDescription className="text-center">
                        Entre com suas credenciais para acessar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="seu@email.com" {...field} />
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
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.formState.errors.root && (
                                <div className="text-sm text-red-500 text-center">
                                    {form.formState.errors.root.message}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Entrar
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Ou
                                    </span>
                                </div>
                            </div>

                            <Link href="/register" className="w-full block">
                                <Button variant="outline" className="w-full" type="button">
                                    Novo Cadastro
                                </Button>
                            </Link>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
