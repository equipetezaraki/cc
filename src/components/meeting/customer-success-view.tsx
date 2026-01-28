'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Heart, Calendar } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"

interface CSTouchpoint {
    name: string
    date: Date
    isCompleted: boolean
}

interface CSProject {
    id: string
    projectName: string
    clientName: string
    finalDeliveryDate: Date | null
    touchpoints: CSTouchpoint[]
}

interface CSViewProps {
    projects: CSProject[]
}

export function CustomerSuccessView({ projects }: CSViewProps) {
    const today = startOfDay(new Date())

    return (
        <Card className="w-full bg-white/50 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800/60 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
                    Sucesso do Cliente (Pós-Entrega)
                </CardTitle>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Acompanhamento Semestral
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Projeto / Entrega</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">T1 (+15d)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">T2 (1m)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">T3 (2m)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">T4 (3m)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">T5 (4m)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">T6 (6m)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400 italic">
                                        Nenhum projeto em fase de Sucesso do Cliente ainda.
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{project.projectName}</div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] text-slate-400 font-medium uppercase">{project.clientName}</span>
                                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                    Entregue: {project.finalDeliveryDate ? format(project.finalDeliveryDate, 'dd/MM/yy') : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        {project.touchpoints.map((tp, idx) => {
                                            const tpDate = tp.date instanceof Date ? tp.date : new Date(tp.date)
                                            const isPast = isBefore(tpDate, today)
                                            const isSoon = !tp.isCompleted && isBefore(tpDate, startOfDay(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)))

                                            return (
                                                <td key={idx} className="px-4 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {tp.isCompleted ? (
                                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 rounded-full p-0.5" />
                                                        ) : isSoon ? (
                                                            <Circle className="h-5 w-5 text-amber-500 animate-pulse fill-amber-500/10" />
                                                        ) : isPast ? (
                                                            <Circle className="h-5 w-5 text-rose-500 fill-rose-500/10" />
                                                        ) : (
                                                            <Circle className="h-5 w-5 text-slate-200 dark:text-slate-800" />
                                                        )}
                                                        <span className={`text-[9px] font-bold ${tp.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : isSoon ? 'text-amber-600' : isPast ? 'text-rose-600' : 'text-slate-400'}`}>
                                                            {format(tpDate, 'dd/MM')}
                                                        </span>
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
