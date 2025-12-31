"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Target, TrendingUp, ThumbsUp, ThumbsDown, Minus } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { DashboardWidget } from "./dashboard-widget"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface AIAnalyticsProps {
    metrics: any
    timeSeriesData: any
    isLoading: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
const SENTIMENT_COLORS = {
    positive: '#22c55e',
    neutral: '#94a3b8',
    negative: '#ef4444'
}

export function AIAnalyticsSection({ metrics, timeSeriesData, isLoading }: AIAnalyticsProps) {
    const [viewMode, setViewMode] = useState<"sentiment" | "objections" | "intents">("sentiment")
    const [showPercentage, setShowPercentage] = useState(false)

    // Transform data for the Chart based on viewMode
    // Ensure timeSeriesData is available before mapping
    const chartData = timeSeriesData?.labels?.map((label: string, index: number) => {
        const base = { name: label, total: timeSeriesData.monthlyTotals[index] }

        if (viewMode === 'sentiment') {
            return {
                ...base,
                Positivo: timeSeriesData.sentiment.positive[index],
                Neutro: timeSeriesData.sentiment.neutral[index],
                Negativo: timeSeriesData.sentiment.negative[index]
            }
        } else if (viewMode === 'objections') {
            const objData: any = { ...base }
            timeSeriesData.topObjectionsKeys.forEach((key: string) => {
                objData[key] = timeSeriesData.objections[key][index]
            })
            return objData
        } else { // intents
            const intData: any = { ...base }
            timeSeriesData.topIntentsKeys.forEach((key: string) => {
                intData[key] = timeSeriesData.intents[key][index]
            })
            return intData
        }
    }) || []

    // Helper to get value (Absolute vs %)
    const getValue = (val: number, total: number) => {
        if (!showPercentage) return val
        if (total === 0) return 0
        return Math.round((val / total) * 100)
    }

    // Custom Tick Formatter
    const formatYAxis = (val: number) => showPercentage ? `${val}%` : `${val}`

    // Render Lines dynamically
    const renderLines = () => {
        if (viewMode === 'sentiment') {
            return [
                <Line key="pos" type="monotone" dataKey={d => getValue(d.Positivo, d.total)} name="Positivo" stroke={SENTIMENT_COLORS.positive} strokeWidth={2} dot={false} />,
                <Line key="neu" type="monotone" dataKey={d => getValue(d.Neutro, d.total)} name="Neutro" stroke={SENTIMENT_COLORS.neutral} strokeWidth={2} dot={false} />,
                <Line key="neg" type="monotone" dataKey={d => getValue(d.Negativo, d.total)} name="Negativo" stroke={SENTIMENT_COLORS.negative} strokeWidth={2} dot={false} />
            ]
        }

        const keys = viewMode === 'objections' ? timeSeriesData?.topObjectionsKeys : timeSeriesData?.topIntentsKeys
        return keys?.map((key: string, i: number) => (
            <Line
                key={key}
                type="monotone"
                dataKey={d => getValue(d[key], d.total)}
                name={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
            />
        ))
    }

    return (
        <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Análise de Conversas com IA</h2>
                    <p className="text-muted-foreground">Insights exclusivos capturados por Inteligência Artificial</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white dark:bg-slate-950 px-3 py-1 rounded-full border shadow-sm">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>Dados em tempo real</span>
                </div>
            </div>

            {/* Snapshot Widgets */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Sentiment Widget */}
                <DashboardWidget
                    title="Análise de Sentimento"
                    description="Visão Geral (Período)"
                    isLoading={isLoading}
                >
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics?.sentimentData || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(metrics?.sentimentData || []).map((entry: any, index: number) => {
                                        const lowerName = entry.name.toLowerCase()
                                        let color = COLORS[index % COLORS.length]
                                        if (lowerName.includes('positivo')) color = SENTIMENT_COLORS.positive
                                        if (lowerName.includes('neutro')) color = SENTIMENT_COLORS.neutral
                                        if (lowerName.includes('negativo')) color = SENTIMENT_COLORS.negative
                                        return <Cell key={`cell-${index}`} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', opacity: 1, borderRadius: 'var(--radius)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5"><ThumbsUp className="w-3 h-3 text-green-500" /> <span className="text-xs">Positivo</span></div>
                        <div className="flex items-center gap-1.5"><Minus className="w-3 h-3 text-slate-400" /> <span className="text-xs">Neutro</span></div>
                        <div className="flex items-center gap-1.5"><ThumbsDown className="w-3 h-3 text-red-500" /> <span className="text-xs">Negativo</span></div>
                    </div>
                </DashboardWidget>

                {/* Top Objections */}
                <DashboardWidget
                    title="Top Objeções"
                    description="Principais barreiras (Período)"
                    isLoading={isLoading}
                >
                    <div className="space-y-4">
                        {(metrics?.topObjections || []).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma objeção detectada</p>
                        )}
                        {(metrics?.topObjections || []).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                </div>
                                <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    {item.value} ({item.percentage}%)
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardWidget>

                {/* Top Intents */}
                <DashboardWidget
                    title="Top Intenções"
                    description="O que os leads buscam (Período)"
                    isLoading={isLoading}
                >
                    <div className="space-y-4">
                        {(metrics?.topIntents || []).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma intenção detectada</p>
                        )}
                        {(metrics?.topIntents || []).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Target className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                </div>
                                <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    {item.value} ({item.percentage}%)
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardWidget>
            </div>

            {/* Time Series Chart */}
            <DashboardWidget
                title="Evolução Temporal (12 Meses)"
                description="Acompanhe tendências e mudanças de comportamento"
                isLoading={isLoading}
                className="col-span-full"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="sentiment">Sentimento</TabsTrigger>
                            <TabsTrigger value="objections">Objeções</TabsTrigger>
                            <TabsTrigger value="intents">Intenções</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center space-x-2">
                        <Switch id="percentage-mode" checked={showPercentage} onCheckedChange={setShowPercentage} />
                        <Label htmlFor="percentage-mode">Visualizar em %</Label>
                    </div>
                </div>

                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatYAxis}
                            />
                            <Tooltip
                                formatter={(val: number) => showPercentage ? `${val}%` : val}
                                contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', opacity: 1, borderRadius: 'var(--radius)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Legend />
                            {renderLines()}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </DashboardWidget>
        </div>
    )
}
