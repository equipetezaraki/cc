import { getMeetingDashboardData } from "./actions"
import { MiniKanban } from "@/components/meeting/mini-kanban"
import { TaskControl } from "@/components/meeting/task-control"
import { ProjectGantt } from "@/components/meeting/project-gantt"
import { LayoutGrid, GanttChartSquare, ClipboardCheck } from "lucide-react"

export const dynamic = 'force-dynamic'

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-4 mb-6">
        <div className="p-2 bg-[#4dbaaf]/10 rounded-lg">
            <Icon className="h-5 w-5 text-[#4dbaaf]" />
        </div>
        <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
    </div>
)

export default async function MeetingDashboardPage() {
    const data = await getMeetingDashboardData()

    return (
        <div className="h-screen bg-[#121226] text-slate-200 flex flex-col overflow-hidden">
            {/* Header Tezaraki */}
            <header className="px-10 py-5 flex justify-between items-center bg-[#121226] border-b border-white/[0.03] flex-shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-semibold text-white tracking-tight leading-none">Farol de Controle</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Weekly Strategic Cockpit</p>
                            <div className="w-1 h-1 rounded-full bg-[#4dbaaf]/50" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-8 custom-scrollbar bg-[#121226]">
                <div className="px-10 space-y-12 pb-24 max-w-[1800px] mx-auto">
                    {/* Nível 1: Resumo Kanban */}
                    <div>
                        <SectionHeader icon={LayoutGrid} title="Status da Carteira" />
                        <MiniKanban summary={data.kanbanSummary} />
                    </div>

                    {/* Nível 2: Cronograma Macro */}
                    <div>
                        <SectionHeader icon={GanttChartSquare} title="Cronograma de Execução" />
                        <ProjectGantt projects={data.ganttProjects} />
                    </div>

                    {/* Nível 3: Controle Operacional */}
                    <div>
                        <SectionHeader icon={ClipboardCheck} title="Entregas e Prazos" />
                        <TaskControl overdue={data.overdueTasks} upcoming={data.upcomingTasks} />
                    </div>
                </div>
            </div>
        </div>
    )
}
