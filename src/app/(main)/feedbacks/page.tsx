'use client'

import { useState, useEffect } from "react"
import { getAllFeedbacks, updateFeedbackStatus } from "@/app/(main)/feedbacks/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { MessageSquare, MapPin, User, Building, CheckCircle2, Clock, Send, Eye } from "lucide-react"

export default function FeedbacksManagementPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
    const [conclusionComment, setConclusionComment] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL')
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')

    useEffect(() => {
        loadFeedbacks()
    }, [])

    async function loadFeedbacks() {
        try {
            const data = await getAllFeedbacks()
            setFeedbacks(data)
        } catch (error) {
            console.error(error)
            toast.error("Erro ao carregar feedbacks")
        }
    }

    async function handleComplete() {
        if (!selectedFeedback) return

        setIsLoading(true)
        try {
            await updateFeedbackStatus(selectedFeedback.id, 'COMPLETED', conclusionComment)
            toast.success("Feedback concluído com sucesso!")
            setIsDialogOpen(false)
            setConclusionComment('')
            setSelectedFeedback(null)
            loadFeedbacks()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao atualizar feedback")
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
            // Rule: PENDING first (unless filtered)
            if (a.status !== b.status) {
                return a.status === 'PENDING' ? -1 : 1
            }

            // Then sort by date
            const timeA = new Date(a.createdAt).getTime()
            const timeB = new Date(b.createdAt).getTime()

            return sortOrder === 'ASC' ? timeA - timeB : timeB - timeA
        })

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Feedbacks</h1>
                    <p className="text-muted-foreground">Gerencie o retorno dos clientes sobre a Inteligência Artificial.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{feedbacks.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {feedbacks.filter(f => f.status === 'PENDING').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {feedbacks.filter(f => f.status === 'COMPLETED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle>Lista de Feedbacks</CardTitle>
                        <CardDescription>Acompanhe e responda aos comentários dos clientes.</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">Status:</span>
                            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                    <SelectValue placeholder="Filtrar por Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="PENDING">Pendentes</SelectItem>
                                    <SelectItem value="COMPLETED">Concluídos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">Ordem:</span>
                            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ASC">Antigos</SelectItem>
                                    <SelectItem value="DESC">Recentes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Local</TableHead>
                                <TableHead className="max-w-[300px]">Feedback</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedFeedbacks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Nenhum feedback encontrado {statusFilter !== 'ALL' ? 'para este filtro' : ''}.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedFeedbacks.map((feedback) => (
                                    <TableRow key={feedback.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium flex items-center gap-1">
                                                    <User className="h-3 w-3" /> {feedback.client.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Building className="h-3 w-3" /> {feedback.client.company || 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                {feedback.location}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px]">
                                            <p className="truncate text-sm" title={feedback.content}>
                                                {feedback.content}
                                            </p>
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {new Date(feedback.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog open={isDialogOpen && selectedFeedback?.id === feedback.id} onOpenChange={(open) => {
                                                setIsDialogOpen(open)
                                                if (open) {
                                                    setSelectedFeedback(feedback)
                                                    setConclusionComment(feedback.conclusionComment || '')
                                                }
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant={feedback.status === 'COMPLETED' ? "outline" : "default"}
                                                        size="sm"
                                                        className={cn(
                                                            feedback.status === 'PENDING' && "shadow-sm"
                                                        )}
                                                    >
                                                        {feedback.status === 'COMPLETED' ? (
                                                            <><Eye className="mr-2 h-4 w-4" /> Ver Detalhes</>
                                                        ) : (
                                                            <><MessageSquare className="mr-2 h-4 w-4" /> Responder</>
                                                        )}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[500px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Detalhes do Feedback</DialogTitle>
                                                        <DialogDescription>
                                                            Enviado por {feedback.client.name} em {new Date(feedback.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Localização</Label>
                                                            <div className="p-3 bg-muted rounded-md text-sm">
                                                                {feedback.location}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Detalhamento do Cliente</Label>
                                                            <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                                                                {feedback.content}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <Label htmlFor="comment" className="text-xs uppercase font-bold text-muted-foreground">Comentário de Conclusão</Label>
                                                                {feedback.status === 'COMPLETED' && (
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        Resolvido em: {new Date(feedback.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Textarea
                                                                id="comment"
                                                                placeholder="Descreva as ações tomadas ou responda ao cliente..."
                                                                value={conclusionComment}
                                                                onChange={(e) => setConclusionComment(e.target.value)}
                                                                className="min-h-[100px]"
                                                                disabled={feedback.status === 'COMPLETED'}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        {feedback.status === 'PENDING' ? (
                                                            <Button onClick={handleComplete} disabled={isLoading}>
                                                                <Send className="mr-2 h-4 w-4" />
                                                                {isLoading ? "Salvando..." : "Concluir e Responder"}
                                                            </Button>
                                                        ) : (
                                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
                                                        )}
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
