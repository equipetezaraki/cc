'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Briefcase, Calendar } from "lucide-react"

interface FinancialSummaryProps {
    summary: {
        totalContracted: number
        currentMRR: number
        totalImplementation: number
        upcomingRevenue: number
    }
}

export function FinancialSummary({ summary }: FinancialSummaryProps) {
    const metrics = [
        {
            title: "Total Contratado",
            value: `R$ ${summary.totalContracted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            description: "Valor bruto de todos os contratos",
            icon: DollarSign,
            color: "text-primary"
        },
        {
            title: "MRR Atual",
            value: `R$ ${summary.currentMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            description: "Mensalidades do mês vigente",
            icon: TrendingUp,
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            title: "Impl. Total",
            value: `R$ ${summary.totalImplementation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            description: "Total acumulado de implementação",
            icon: Briefcase,
            color: "text-green-600 dark:text-green-400"
        },
        {
            title: "Próximos 90 Dias",
            value: `R$ ${summary.upcomingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            description: "Projeção de recebimento (Forecast)",
            icon: Calendar,
            color: "text-orange-600 dark:text-orange-400"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {metric.title}
                        </CardTitle>
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metric.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
