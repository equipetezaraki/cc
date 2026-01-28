'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    AlertTriangle,
    TrendingDown,
    Users,
    CheckCircle2,
    DollarSign,
    Target
} from "lucide-react"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip
} from 'recharts'

interface SummaryProps {
    stats: {
        revenueAtRisk: number
        totalProjects: number
        lateProjects: number
        roleBottlenecks: { role: string, count: number }[]
    }
    projectHealth: {
        riskLevel: string
    }[]
}

export function MeetingSummaryCards({ stats, projectHealth }: SummaryProps) {
    const healthData = [
        { name: 'Crítico', value: projectHealth.filter(p => p.riskLevel === 'CRITICAL').length, color: '#ef4444' },
        { name: 'Alerta', value: projectHealth.filter(p => p.riskLevel === 'WARNING').length, color: '#f59e0b' },
        { name: 'Saudável', value: projectHealth.filter(p => p.riskLevel === 'HEALTHY').length, color: '#10b981' },
    ].filter(d => d.value > 0)

    const healthScore = Math.round(
        (projectHealth.filter(p => p.riskLevel === 'HEALTHY').length / (stats.totalProjects || 1)) * 100
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Health Score Global */}
            <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800/60 transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Health Score Global</CardTitle>
                    <Target className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{healthScore}%</div>
                            <p className="text-xs text-slate-500 mt-1">Status da Carteira</p>
                        </div>
                        <div className="h-[60px] w-[60px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={healthData}
                                        innerRadius={18}
                                        outerRadius={28}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {healthData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <Progress value={healthScore} className="h-1.5 mt-4" />
                </CardContent>
            </Card>

            {/* Receita em Risco */}
            <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800/60 transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Mensalidade em Risco</CardTitle>
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenueAtRisk)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        <span className="text-xs text-rose-600 font-medium">
                            {stats.lateProjects} projetos com atraso
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Projetos Ativos */}
            <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800/60 transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Projetos</CardTitle>
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</div>
                    <p className="text-xs text-slate-500 mt-1">Ativos no funil</p>
                </CardContent>
            </Card>

            {/* Gargalo da Semana */}
            <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800/60 transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Gargalo da Semana</CardTitle>
                    <Users className="w-4 h-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    {stats.roleBottlenecks.length > 0 ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.roleBottlenecks[0].role}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {stats.roleBottlenecks[0].count} pendências
                                </p>
                            </div>
                            <div className="h-[50px] w-[80px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.roleBottlenecks.slice(0, 3)}>
                                        <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-500 italic mt-2">Sem gargalos identificados</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
