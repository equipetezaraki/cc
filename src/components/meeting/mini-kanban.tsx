'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, LayoutGrid } from "lucide-react"

interface MiniKanbanProps {
    summary: {
        stageNumber: number
        stageName: string
        projectCount: number
        projects: { id: string, name: string, clientName: string }[]
    }[]
}

export function MiniKanban({ summary }: MiniKanbanProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {summary.map((stage) => (
                <Card key={stage.stageNumber} className="border border-white/[0.03] bg-[#1c1d3e]/30 shadow-sm overflow-hidden group hover:bg-[#1c1d3e]/50 transition-all duration-200">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3.5">
                            <div className="flex justify-between items-center flex-none">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">{stage.stageName}</span>
                                <span className="text-[10px] font-medium text-slate-400 font-sans">
                                    {stage.projectCount}
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex-none">
                                <div
                                    className="h-full bg-[#4dbaaf] transition-all duration-500"
                                    style={{ width: `${Math.min(100, (stage.projectCount / 8) * 100)}%` }}
                                />
                            </div>
                            <div className="flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 min-h-0 max-h-[200px]">
                                {stage.projects.map((p) => (
                                    <div key={p.id} className="text-[11px] text-slate-300 truncate font-medium flex items-center gap-2 flex-none">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#4dbaaf]/20 flex-none" />
                                        <span className="truncate">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
