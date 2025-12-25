'use client'

import { useState, useEffect } from "react"
import { createFeedback, getClientFeedbacks } from "@/app/(main)/feedbacks/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { MessageSquare, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default function ClientFeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({ content: '', location: '' })
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL')
    const [sortOrder, setSortOrder] = useState<'DEFAULT' | 'DATE_ASC' | 'DATE_DESC'>('DEFAULT')

    useEffect(() => {
        loadFeedbacks()
    }, [])

    async function loadFeedbacks() {
        try {
            const data = await getClientFeedbacks()
            setFeedbacks(data)
        } catch (error) {
            console.error(error)
            toast.error("Erro ao carregar feedbacks")
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!formData.content || !formData.location) {
            toast.error("Por favor, preencha todos os campos")
            return
        }

        setIsLoading(true)
        try {
            await createFeedback(formData)
            toast.success("Feedback enviado com sucesso!")
            setFormData({ content: '', location: '' })
            loadFeedbacks()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao enviar feedback")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredAndSortedFeedbacks = feedbacks
        .filter(f => {
            if (statusFilter === 'ALL') return true
            return f.status === statusFilter
        })
        .sort((a, b) => {
            if (sortOrder === 'DEFAULT') {
                // Rule: PENDING first, then oldest first
                if (a.status !== b.status) {
                    return a.status === 'PENDING' ? -1 : 1
                }
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            }

            if (sortOrder === 'DATE_ASC') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            }

            if (sortOrder === 'DATE_DESC') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }

            return 0
        })

    return (
        <div className="container mx-auto py-10 space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Feedbacks sobre a IA</h1>
                <p className="text-muted-foreground">Sua opinião nos ajuda a melhorar constantemente a experiência da nossa inteligência artificial.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Novo Feedback</CardTitle>
                        <CardDescription>Nos conte sua experiência ou sugira melhorias.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Local do Feedback</Label>
                                <Input
                                    id="location"
                                    placeholder="Ex: No atendimento inicial, Na entrega de briefs..."
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Detalhamento</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Descreva detalhadamente o que você achou ou o que podemos melhorar..."
                                    className="min-h-[150px]"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Enviando..." : "Enviar Feedback"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Histórico
                        </h2>

                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                                <SelectTrigger className="w-[120px] h-8 text-[11px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="PENDING">Pendentes</SelectItem>
                                    <SelectItem value="COMPLETED">Concluídos</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                                <SelectTrigger className="w-[130px] h-8 text-[11px]">
                                    <SelectValue placeholder="Ordem" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DEFAULT">Padrão</SelectItem>
                                    <SelectItem value="DATE_ASC">Antigos</SelectItem>
                                    <SelectItem value="DATE_DESC">Recentes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {filteredAndSortedFeedbacks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/50 text-center">
                            <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">
                                {feedbacks.length === 0
                                    ? "Você ainda não enviou nenhum feedback."
                                    : "Nenhum feedback encontrado para este filtro."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
                            {filteredAndSortedFeedbacks.map((feedback) => (
                                <Card key={feedback.id} className="overflow-hidden border-l-4 border-l-primary/50">
                                    <CardHeader className="py-4">
                                        <div className="flex items-center justify-between mb-2">
                                            {feedback.status === 'COMPLETED' ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 gap-1 px-2 py-0.5">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Concluído
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 gap-1 px-2 py-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    Pendente
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Enviado em: {new Date(feedback.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                            <MapPin className="h-3 w-3" />
                                            {feedback.location}
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{feedback.content}</p>
                                    </CardHeader>

                                    {feedback.conclusionComment && (
                                        <div className="bg-muted px-4 py-3 border-t">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    <AlertCircle className="h-3 w-3" /> Resposta da Equipe
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Resolvido em: {new Date(feedback.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm italic">{feedback.conclusionComment}</p>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
