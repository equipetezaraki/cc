'use client'

import { useEffect, useState } from 'react'
import { getClientProject, getDashboardMetrics } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { Users, MessageSquare, Clock, Bot, TrendingUp, AlertCircle, HelpCircle, Target } from 'lucide-react'
import { ClientOnboarding } from "@/components/client-onboarding"

export default function DashboardPage() {
    const [project, setProject] = useState<any>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const projectData = await getClientProject()
                if (projectData) {
                    setProject(projectData)
                    console.log("DEBUG: Project Data", projectData)
                    // Only load metrics if not in onboarding
                    if (projectData.status !== 'ONBOARDING') {
                        const metricsData = await getDashboardMetrics(projectData.id)
                        setMetrics(metricsData)
                    }
                }
            } catch (error) {
                console.error("Error loading dashboard:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

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

    // Check for Onboarding Status
    if (project.status === 'ONBOARDING') {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {project.name}</h1>
                    <p className="text-muted-foreground">
                        Estamos preparando tudo para o seu projeto. Por favor, complete as etapas abaixo.
                    </p>
                </div>
                <ClientOnboarding
                    projectId={project.id}
                    faqLink={project.faqLink}
                    initialData={{
                        openAiKey: project.openAiKey,
                        openRouterKey: project.openRouterKey,
                        faqConfirmed: project.faqConfirmed,
                        speakingStyleConfirmed: project.speakingStyleConfirmed,
                    }}
                    hasPendingOnboardingTask={project.hasPendingOnboardingTask}
                />
            </div>
        )
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral do projeto: <span className="font-semibold text-foreground">{project.name}</span>
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalMessages || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics?.aiMessages || 0} enviadas pela IA
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads Únicos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.uniqueLeads || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Atendidos no período
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Retenção da IA</CardTitle>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.retentionRate || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            Resolvidos sem humano
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.avgResponseTime || '-'}</div>
                        <p className="text-xs text-muted-foreground">
                            De resposta
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Volume de Mensagens (24h)</CardTitle>
                        <CardDescription>
                            Distribuição de mensagens por hora no último dia
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
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
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Funil de Vendas</CardTitle>
                        <CardDescription>
                            Leads por etapa do CRM
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={metrics?.funnelStats || []}>
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
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Bar dataKey="value" fill="#adfa1d" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Sentimento</CardTitle>
                        <CardDescription>Classificação das conversas</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                        {(metrics?.sentimentData || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {(metrics?.sentimentData || []).map((entry: any, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Objeções</CardTitle>
                        <CardDescription>Principais barreiras identificadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(metrics?.topObjections || []).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma objeção detectada</p>
                            )}
                            {(metrics?.topObjections || []).map((item: any, i: number) => (
                                <div key={i} className="flex items-center">
                                    <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                    </div>
                                    <div className="font-bold text-sm">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Intenções</CardTitle>
                        <CardDescription>O que os leads buscam</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(metrics?.topIntents || []).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma intenção detectada</p>
                            )}
                            {(metrics?.topIntents || []).map((item: any, i: number) => (
                                <div key={i} className="flex items-center">
                                    <Target className="mr-2 h-4 w-4 text-blue-500" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                    </div>
                                    <div className="font-bold text-sm">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
