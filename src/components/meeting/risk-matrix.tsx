'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Project {
    id: string
    name: string
    clientName: string
    riskLevel: 'CRITICAL' | 'WARNING' | 'HEALTHY'
    nextDeadline: Date | null
    progress: number
}

interface RiskMatrixProps {
    projects: Project[]
}

export function RiskMatrix({ projects }: RiskMatrixProps) {
    const groups = {
        CRITICAL: projects.filter(p => p.riskLevel === 'CRITICAL'),
        WARNING: projects.filter(p => p.riskLevel === 'WARNING'),
        HEALTHY: projects.filter(p => p.riskLevel === 'HEALTHY'),
    }

    const Section = ({ title, icon: Icon, items, colorClass, bgClass }: {
        title: string,
        icon: any,
        items: Project[],
        colorClass: string,
        bgClass: string
    }) => (
        <div className="space-y-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${colorClass} uppercase tracking-wider`}>
                <Icon className="w-4 h-4" />
                {title} ({items.length})
            </h3>
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-4 text-center border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/20">
                        Nenhum projeto nesta categoria
                    </div>
                ) : (
                    items.map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                            <Card className={`group relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all mb-3 ${bgClass} bg-opacity-40 backdrop-blur-[2px]`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass.replace('text-', 'bg-')}`} />
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                                {project.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 uppercase font-medium">{project.clientName}</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-slate-400 font-medium">Progresso</span>
                                            <span className="text-slate-600 dark:text-slate-300 font-bold">{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-1" />
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-[10px] text-slate-400">
                                                Meta: {project.nextDeadline ? format(project.nextDeadline, "dd/MM") : "N/A"}
                                            </div>
                                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-none ${bgClass.replace('20', '40')} ${colorClass}`}>
                                                {project.riskLevel}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Section
                title="Atenção Crítica"
                icon={AlertCircle}
                items={groups.CRITICAL}
                colorClass="text-rose-600"
                bgClass="bg-rose-50 dark:bg-rose-900/20"
            />
            <Section
                title="Pontos de Alerta"
                icon={AlertTriangle}
                items={groups.WARNING}
                colorClass="text-amber-600"
                bgClass="bg-amber-50 dark:bg-amber-900/20"
            />
            <Section
                title="Saudáveis"
                icon={CheckCircle2}
                items={groups.HEALTHY}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50 dark:bg-emerald-900/20"
            />
        </div>
    )
}
