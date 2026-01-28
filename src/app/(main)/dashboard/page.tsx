'use client'

import { useEffect, useState } from 'react'
import { getClientProject, getDashboardMetrics, getAiAnalyticsTimeSeries } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Users, MessageSquare, Clock, Bot, AlertCircle, Moon, BarChart3, Receipt, ArrowRight, ExternalLink } from 'lucide-react'
import { ClientOnboarding } from "@/components/client-onboarding"
import { DashboardWidget } from "@/components/dashboard/dashboard-widget"
import { AIAnalyticsSection } from "@/components/dashboard/ai-analytics-section"
import { DateRange } from "react-day-picker"
import { subDays } from 'date-fns'
import { BusinessHoursSettings } from "@/components/dashboard/business-hours-settings"
import { MonthRangeFilter } from "@/components/dashboard/month-range-filter"

export default function DashboardPage() {
    const [project, setProject] = useState<any>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [timeSeriesData, setTimeSeriesData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [loadingMetrics, setLoadingMetrics] = useState(false)

    // Global Date Filter State
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    })

    // Load Project Initial Data
    useEffect(() => {
        async function loadProject() {
            try {
                const projectData = await getClientProject()
                if (projectData) {
                    setProject(projectData)
                }
            } catch (error) {
                console.error("Error loading project:", error)
            } finally {
                setLoading(false)
            }
        }
        loadProject()
    }, [])

    // Load Metrics when Date Range or Project changes
    useEffect(() => {
        async function loadMetrics() {
            if (!project) return

            setLoadingMetrics(true)
            try {
                const [metricsData, tsData] = await Promise.all([
                    getDashboardMetrics(project.id, dateRange ? { from: dateRange.from!, to: dateRange.to! } : undefined),
                    getAiAnalyticsTimeSeries(project.id)
                ])
                setMetrics(metricsData)
                setTimeSeriesData(tsData)
            } catch (error) {
                console.error("Error loading metrics:", error)
            } finally {
                setLoadingMetrics(false)
            }
        }
        loadMetrics()
    }, [project, dateRange])

    if (loading) {
        return <div className="flex items-center justify-center h-full">Carregando dashboard...</div>
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold">Nenhum projeto encontrado</h2>
                <p>Entre em contato com o suporte.</p>
            </div>
        )
    }


    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header & Global Filter */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">
                            Visão analítica de <span className="font-semibold text-foreground">{project.name}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <BusinessHoursSettings
                        projectId={project.id}
                        initialStart={project.businessHoursStart ?? 9}
                        initialEnd={project.businessHoursEnd ?? 18}
                        onRefresh={() => {
                            // Simple way to trigger re-fetch: update project state or toggle a dummy state
                            // Reloading project to get new settings + reloading metrics
                            setLoadingMetrics(true)
                            getClientProject().then(p => {
                                if (p) setProject(p) // This triggers the useEffect for metrics
                            })
                        }}
                    />
                    <MonthRangeFilter
                        date={dateRange}
                        setDate={setDateRange}
                        minDate={project.createdAt ? new Date(project.createdAt) : new Date()}
                    />
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardWidget title="Total de Mensagens" icon={<MessageSquare className="h-4 w-4" />} isLoading={loadingMetrics}>
                    <div className="text-2xl font-bold">{metrics?.totalMessages || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {metrics?.aiMessages || 0} enviadas pela IA
                    </p>
                </DashboardWidget>

                <DashboardWidget title="Leads Únicos" icon={<Users className="h-4 w-4" />} isLoading={loadingMetrics}>
                    <div className="text-2xl font-bold">{metrics?.uniqueLeads || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Interagiram no período
                    </p>
                </DashboardWidget>

                <DashboardWidget title="Atendimentos sem humanos" icon={<Bot className="h-4 w-4" />} isLoading={loadingMetrics}>
                    <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold">{metrics?.metrics?.retentionRate || 0}%</div>
                        <div className="text-xs text-muted-foreground">({metrics?.metrics?.fullyHandled || 0} conversas)</div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex gap-1 items-center">
                        <ArrowRight className="w-3 h-3" />
                        <span>Resolvidos inteiramente pela IA</span>
                    </div>
                </DashboardWidget>

                <DashboardWidget title="Encaminhamento para humano" icon={<Users className="h-4 w-4" />} isLoading={loadingMetrics}>
                    <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold">
                            {(metrics?.metrics?.fullyHandled + metrics?.metrics?.humanIntervention) > 0
                                ? 100 - (metrics?.metrics?.retentionRate || 0)
                                : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">({metrics?.metrics?.humanIntervention || 0} conversas)</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Necessitaram de intervenção
                    </p>
                </DashboardWidget>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardWidget title="Tempo Médio Resp." icon={<Clock className="h-4 w-4" />} isLoading={loadingMetrics}>
                    <div className="text-2xl font-bold">{metrics?.metrics?.avgResponseTime || '-'}</div>
                    <p className="text-xs text-muted-foreground mt-1">Do cliente</p>
                </DashboardWidget>

                <DashboardWidget title="Duração Média" icon={<Clock className="h-4 w-4" />} isLoading={loadingMetrics}>
                    <div className="text-2xl font-bold">{metrics?.metrics?.avgConversationDuration || '-'}</div>
                    <p className="text-xs text-muted-foreground mt-1">Por conversa completa</p>
                </DashboardWidget>

                <DashboardWidget title="Fora do Expediente" icon={<Moon className="h-4 w-4" />} isLoading={loadingMetrics} className="col-span-2 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                {metrics?.metrics?.outOfHoursCount || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Atendimentos realizados (fora de h.)
                            </p>
                        </div>
                        <div className="h-10 w-px bg-indigo-200 dark:bg-indigo-800 mx-2"></div>
                        <div>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                {metrics?.metrics?.outOfHoursPercentage || 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Do volume total
                            </p>
                        </div>
                    </div>
                </DashboardWidget>
            </div>

            {/* Analysis Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <DashboardWidget
                    title="Distribuição Horária (24h)"
                    description="Picos de atendimento por hora"
                    className="col-span-4"
                    isLoading={loadingMetrics}
                >
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics?.messagesByHour || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="hour"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={2} // Show every 2nd label to avoid clutter
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', opacity: 1, borderRadius: 'var(--radius)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardWidget>

                <DashboardWidget
                    title="Funil de Vendas"
                    description="Distribuição por funil e etapa"
                    className="col-span-3"
                    isLoading={loadingMetrics}
                >
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={metrics?.funnelStats || []}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', opacity: 1, borderRadius: 'var(--radius)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                {(metrics?.funnelStats && metrics.funnelStats.length > 0) ? (
                                    Object.keys(metrics.funnelStats[0])
                                        .filter(key => key !== 'name')
                                        .map((key, index) => (
                                            <Bar
                                                key={key}
                                                dataKey={key}
                                                stackId="a"
                                                fill={['#adfa1d', '#2563eb', '#db2777', '#f59e0b', '#059669', '#7c3aed'][index % 6]}
                                                radius={[0, 4, 4, 0]}
                                            />
                                        ))
                                ) : null}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </DashboardWidget>
            </div>

            {/* AI Analytics Dedicated Section */}
            <AIAnalyticsSection
                metrics={metrics}
                timeSeriesData={timeSeriesData}
                isLoading={loadingMetrics}
            />
        </div>
    )
}

