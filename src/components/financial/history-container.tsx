'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight, Filter, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface HistoryContainerProps {
    initialData: any[]
}

export function HistoryContainer({ initialData }: HistoryContainerProps) {
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [searchTerm, setSearchTerm] = useState("")

    const filteredClients = useMemo(() => {
        return initialData.map(client => {
            const filteredProjects = client.projects.filter((project: any) => {
                const statusMatch = statusFilter === "ALL" || project.status === statusFilter
                const searchMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    client.name.toLowerCase().includes(searchTerm.toLowerCase())

                return statusMatch && searchMatch && project.contracts.length > 0
            })

            return {
                ...client,
                projects: filteredProjects
            }
        }).filter(client => client.projects.length > 0)
    }, [initialData, statusFilter, searchTerm])

    return (
        <div className="space-y-8">
            <Card className="border-primary/10 bg-card/30 shadow-sm backdrop-blur-md">
                <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="space-y-2 flex-1 w-full">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                <Search className="h-3 w-3" /> Buscar Cliente ou Projeto
                            </label>
                            <div className="relative">
                                <Input
                                    placeholder="Digite o nome..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-background/50 border-primary/10 pl-9"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2 w-full md:w-auto">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                <Filter className="h-3 w-3" /> Status do Projeto
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { id: "ALL", label: "Todos" },
                                    { id: "ACTIVE", label: "Ativos" },
                                    { id: "COMPLETED", label: "Encerrados" }
                                ].map((type) => (
                                    <Badge
                                        key={type.id}
                                        variant={statusFilter === type.id ? "default" : "outline"}
                                        className={`cursor-pointer px-4 py-1.5 transition-all ${statusFilter === type.id ? 'shadow-md shadow-primary/20 scale-105' : 'hover:bg-primary/5'}`}
                                        onClick={() => setStatusFilter(type.id)}
                                    >
                                        {type.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {(statusFilter !== "ALL" || searchTerm !== "") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter("ALL")
                                    setSearchTerm("")
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Limpar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-8">
                {filteredClients.map((client) => (
                    <div key={client.id} className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">{client.name}</h2>
                        <div className="grid gap-4 md:grid-cols-1">
                            {client.projects.map((project: any) => (
                                <Card key={project.id} className="overflow-hidden">
                                    <CardHeader className="bg-muted/30 py-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base font-medium">
                                                    {project.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Status do Projeto: <span className={project.status === 'ACTIVE' ? 'text-green-500 font-bold' : 'text-muted-foreground'}>
                                                        {project.status === 'ACTIVE' ? 'ATIVO' : 'ENCERRADO'}
                                                    </span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="space-y-3">
                                            {project.contracts.map((contract: any) => (
                                                <div key={contract.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 border rounded-lg bg-card/50 hover:border-primary/30 transition-colors">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Assinatura</div>
                                                            <div className="text-sm font-medium">{new Date(contract.signatureDate).toLocaleDateString('pt-BR')}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Início Pgto</div>
                                                            <div className="text-sm font-medium">{new Date(contract.paymentStartDate).toLocaleDateString('pt-BR')}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Duração</div>
                                                            <div className="text-sm font-medium">{contract.durationMonths} meses</div>
                                                        </div>
                                                        <div className="space-y-1 text-right md:text-left">
                                                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Contrato</div>
                                                            <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-bold ${contract.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                                                                {contract.isActive ? 'ATUAL' : 'HISTÓRICO'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link href={`/admin/financial/${client.id}`}>
                                                        <Button variant="ghost" size="sm" className="text-xs h-8">
                                                            Detalhes
                                                            <ArrowRight className="h-3 w-3 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredClients.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                            <Filter className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Nenhum contrato encontrado</h3>
                        <p className="text-muted-foreground mt-1 text-sm">Tente ajustar seus filtros de busca ou status.</p>
                        <Button
                            variant="link"
                            onClick={() => {
                                setStatusFilter("ALL")
                                setSearchTerm("")
                            }}
                            className="mt-2"
                        >
                            Limpar Filtros
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
