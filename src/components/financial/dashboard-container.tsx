'use client'

import { useState, useMemo } from "react"
import { FinancialSummary } from "./financial-summary"
import { ForecastChart, type ForecastData } from "./forecast-chart"
import { PeriodSlider } from "./period-slider"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Search, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type FinancialItem } from "@/app/(main)/admin/financial/actions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardContainerProps {
    initialData: {
        items: FinancialItem[]
    }
}

export function DashboardContainer({ initialData }: DashboardContainerProps) {
    const [monthsToShow, setMonthsToShow] = useState(12)
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [clientFilter, setClientFilter] = useState<string>("ALL")
    const [timeMode, setTimeMode] = useState<"YEAR" | "ROLLING">("ROLLING")
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
    const [startMonth, setStartMonth] = useState<string>(() => {
        const now = new Date()
        return `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    })
    const [viewType, setViewType] = useState<"IMPLEMENTATION" | "MONTHLY" | "TOTAL">("TOTAL")

    const allClients = useMemo(() => {
        const clients = new Set(initialData.items.map(i => i.clientName))
        return Array.from(clients).sort()
    }, [initialData.items])

    const allYears = useMemo(() => {
        const years = new Set(initialData.items.map(i => i.date.getFullYear().toString()))
        return Array.from(years).sort()
    }, [initialData.items])

    const allAvailableMonths = useMemo(() => {
        const months = new Map<string, Date>()
        initialData.items.forEach(item => {
            months.set(item.month, item.date)
        })
        return Array.from(months.entries())
            .sort((a, b) => a[1].getTime() - b[1].getTime())
            .map(([month]) => month)
    }, [initialData.items])

    const filteredItems = useMemo(() => {
        return initialData.items.filter(item => {
            const statusMatch = statusFilter === "ALL" || item.projectStatus === statusFilter
            const clientMatch = clientFilter === "ALL" || item.clientName === clientFilter
            return statusMatch && clientMatch
        })
    }, [initialData.items, statusFilter, clientFilter])

    const forecastData = useMemo(() => {
        const map = new Map<string, ForecastData>()
        let startPoint: Date
        let count: number

        if (timeMode === "YEAR") {
            startPoint = new Date(parseInt(selectedYear), 0, 1)
            count = 12
        } else {
            const [m, y] = startMonth.split('/').map(Number)
            startPoint = new Date(y, m - 1, 1)
            count = monthsToShow
        }

        // Initialize months in range
        for (let i = 0; i < count; i++) {
            const date = new Date(startPoint.getFullYear(), startPoint.getMonth() + i, 1)
            const key = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
            map.set(key, { month: key, implementation: 0, monthly: 0 })
        }

        filteredItems.forEach(item => {
            if (map.has(item.month)) {
                const existing = map.get(item.month)!
                map.set(item.month, {
                    ...existing,
                    implementation: existing.implementation + item.implementation,
                    monthly: existing.monthly + item.monthly
                })
            }
        })

        return Array.from(map.values())
    }, [filteredItems, timeMode, selectedYear, startMonth, monthsToShow])

    const summaryData = useMemo(() => {
        // Summary should ideally follow the current chart view or remain global?
        // User asked for "filters for different views" so let's use global filtered items for summary
        // but maybe "upcoming" should follow the startMonth if in rolling mode.

        const now = new Date()
        const currentMonthKey = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

        const totalContracted = filteredItems.reduce((acc, curr) => acc + curr.implementation + curr.monthly, 0)
        const currentMRR = filteredItems
            .filter(item => item.month === currentMonthKey)
            .reduce((acc, curr) => acc + curr.monthly, 0)

        const totalImplementation = filteredItems.reduce((acc, curr) => acc + curr.implementation, 0)

        // Upcoming 90 days from "now" or from "startMonth"? 
        // Let's stick to "now" for executive summary unless user asks otherwise.
        const upcomingRevenue = filteredItems.filter(item => {
            const futureLimit = new Date(now.getFullYear(), now.getMonth() + 3, 1)
            const currentLimit = new Date(now.getFullYear(), now.getMonth(), 1)
            return item.date >= currentLimit && item.date < futureLimit
        }).reduce((acc, curr) => acc + curr.implementation + curr.monthly, 0)

        return {
            totalContracted,
            currentMRR,
            totalImplementation,
            upcomingRevenue
        }
    }, [filteredItems])

    return (
        <div className="space-y-8">
            <Card className="border-primary/10 bg-card/30 shadow-sm backdrop-blur-md">
                <CardContent className="p-6 space-y-6">
                    {/* Top Row: Basic Filters */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 pb-6 border-b border-border/50">
                        <div className="space-y-2 flex-1 w-full lg:max-w-xs">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                <Search className="h-3 w-3" /> Cliente
                            </label>
                            <Select value={clientFilter} onValueChange={setClientFilter}>
                                <SelectTrigger className="bg-background/50 border-primary/10">
                                    <SelectValue placeholder="Todos os Clientes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos os Clientes</SelectItem>
                                    {allClients.map(client => (
                                        <SelectItem key={client} value={client}>{client}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex-1 w-full overflow-x-auto">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                <Filter className="h-3 w-3" /> Status do Projeto
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {["ALL", "ACTIVE", "COMPLETED"].map((status) => (
                                    <Badge
                                        key={status}
                                        variant={statusFilter === status ? "default" : "outline"}
                                        className={`cursor-pointer px-3 py-1 transition-all ${statusFilter === status ? 'shadow-md shadow-primary/20 scale-105' : 'hover:bg-primary/5'}`}
                                        onClick={() => setStatusFilter(status)}
                                    >
                                        {status === "ALL" ? "Todos" : status}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {(statusFilter !== "ALL" || clientFilter !== "ALL") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter("ALL")
                                    setClientFilter("ALL")
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 self-end lg:self-center"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Limpar
                            </Button>
                        )}
                    </div>

                    {/* Middle Row: Time Mode & View Type */}
                    <div className="flex flex-col lg:flex-row items-end gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                <Calendar className="h-3 w-3" /> Modo de Visualização
                            </label>
                            <Tabs value={timeMode} onValueChange={(v: any) => setTimeMode(v)} className="w-[300px]">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="ROLLING">Forecast Rolante</TabsTrigger>
                                    <TabsTrigger value="YEAR">Ano Fixo</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="space-y-3 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                <BarChart3 className="h-3 w-3" /> Composição do Gráfico
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { id: "TOTAL", label: "Visão Total" },
                                    { id: "IMPLEMENTATION", label: "Só Implementação" },
                                    { id: "MONTHLY", label: "Só Mensalidade" }
                                ].map((type) => (
                                    <Badge
                                        key={type.id}
                                        variant={viewType === type.id ? "secondary" : "outline"}
                                        className={`cursor-pointer px-3 py-1.5 transition-all ${viewType === type.id ? 'bg-primary/20 text-primary border-primary/30' : ''}`}
                                        onClick={() => setViewType(type.id as any)}
                                    >
                                        {type.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Dynamic Time Selectors */}
                    <div className="flex flex-col md:flex-row items-end gap-8 pt-4">
                        {timeMode === "ROLLING" ? (
                            <>
                                <div className="space-y-2 w-full max-w-[200px]">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mês Inicial</label>
                                    <Select value={startMonth} onValueChange={setStartMonth}>
                                        <SelectTrigger className="bg-background/50 border-primary/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allAvailableMonths.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <PeriodSlider
                                    value={monthsToShow}
                                    onChange={setMonthsToShow}
                                    min={3}
                                    max={24}
                                    label="Meses para Frente"
                                />
                            </>
                        ) : (
                            <div className="space-y-2 w-full max-w-[200px]">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Selecionar Ano</label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="bg-background/50 border-primary/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allYears.map(y => (
                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <FinancialSummary summary={summaryData} />

            <div className="grid grid-cols-1 gap-8">
                <ForecastChart
                    data={forecastData}
                    viewType={viewType}
                />
            </div>
        </div>
    )
}
