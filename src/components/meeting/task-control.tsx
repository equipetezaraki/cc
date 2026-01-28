'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Task {
    id: string
    title: string
    plannedEnd: Date
    projectName: string
    clientName: string
    daysLate?: number
    assignedRole: string | null
}

interface TaskControlProps {
    overdue: Task[]
    upcoming: Task[]
}

function TaskList({ title, icon: Icon, tasks, emptyMsg, type }: {
    title: string,
    icon: any,
    tasks: Task[],
    emptyMsg: string,
    type: 'overdue' | 'upcoming'
}) {
    return (
        <Card className="border border-white/[0.03] bg-[#1c1d3e]/15 shadow-none flex-1 overflow-hidden">
            <CardHeader className="pb-4 px-6 border-b border-white/[0.03] bg-transparent">
                <CardTitle className={`text-[10px] font-bold flex items-center gap-2.5 text-slate-500 uppercase tracking-widest`}>
                    <Icon className={`w-4 h-4 ${type === 'overdue' ? 'text-[#e2660e]' : 'text-[#4dbaaf]'}`} />
                    {title} <span className="text-slate-600 font-medium">({tasks.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-xs text-slate-600 italic font-medium">{emptyMsg}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.03]">
                        {tasks.map((task) => (
                            <div key={task.id} className="p-5 hover:bg-white/[0.01] transition-all duration-200 group/item cursor-default">
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{task.clientName}</span>
                                            <span className="text-[10px] text-slate-700">•</span>
                                            <span className="text-[10px] font-bold text-[#4dbaaf]/80 truncate uppercase tracking-tight">{task.projectName}</span>
                                        </div>
                                        <div className="text-[14px] font-medium text-slate-200 group-hover/item:text-white transition-colors leading-tight tracking-tight">
                                            {task.title}
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium group-hover/item:text-slate-400 transition-colors">
                                                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                                {format(new Date(task.plannedEnd), "dd 'de' MMMM", { locale: ptBR })}
                                            </div>
                                            {task.assignedRole && (
                                                <div className="px-2 py-0.5 rounded border border-white/[0.05] text-[9px] font-medium text-slate-500 uppercase tracking-wider">
                                                    {task.assignedRole}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {type === 'overdue' && (
                                        <div className="px-2 py-1 rounded bg-[#e2660e]/5 border border-[#e2660e]/20">
                                            <div className="text-[10px] font-bold text-[#e2660e] uppercase tracking-tighter">
                                                Atraso {task.daysLate}d
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function TaskControl({ overdue, upcoming }: TaskControlProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskList
                title="Atenção Crítica (Atrasadas)"
                icon={AlertCircle}
                tasks={overdue}
                emptyMsg="Nenhuma tarefa atrasada. Excelente!"
                type="overdue"
            />
            <TaskList
                title="Agenda Próximos 7 Dias"
                icon={Calendar}
                tasks={upcoming}
                emptyMsg="Sem compromissos agendados para os próximos dias."
                type="upcoming"
            />
        </div>
    )
}
