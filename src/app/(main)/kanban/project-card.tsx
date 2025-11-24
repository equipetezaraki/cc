'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanbanProject } from "./actions"
import { format } from "date-fns"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
    project: KanbanProject
}

export function ProjectCard({ project }: ProjectCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: project.id,
        data: { project }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    // Find the deadline for the current step
    const currentTask = project.tasks.find(t => t.stageRef === project.currentStep)
    const deadline = currentTask ? currentTask.plannedEnd : null
    const isLate = deadline ? new Date() > deadline : false

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-2 cursor-grab active:cursor-grabbing">
            <Link href={`/projects/${project.id}`} className="block">
                <Card className="hover:shadow-lg transition-all dark:bg-primary dark:text-primary-foreground dark:border-none overflow-hidden">
                    <div className="p-3 space-y-2">
                        {/* Title row - full width */}
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold leading-tight line-clamp-2 flex-1">
                                {project.name}
                            </h3>
                            {isLate && (
                                <Badge className="bg-red-600 hover:bg-red-700 text-white border-none text-[10px] px-1.5 h-5 rounded shrink-0">
                                    Atrasado
                                </Badge>
                            )}
                        </div>

                        {/* Info row - client and date */}
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground dark:text-primary-foreground/70 truncate">
                                {project.client.name}
                            </p>
                            <div className="text-right shrink-0">
                                <div className="text-[10px] text-muted-foreground dark:text-primary-foreground/60 uppercase tracking-wide font-medium">
                                    Entrega
                                </div>
                                <div className="text-sm font-bold tabular-nums">
                                    {deadline ? format(deadline, "dd/MM") : "-"}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
    )
}
