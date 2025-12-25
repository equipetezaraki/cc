'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanbanProject } from "./actions"
import { format } from "date-fns"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"

interface ProjectCardProps {
    project: KanbanProject
}

export function ProjectCard({ project }: ProjectCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: project.id,
        data: { project }
    })

    const [justDragged, setJustDragged] = useState(false)

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    // Track when dragging ends
    useEffect(() => {
        if (isDragging) {
            setJustDragged(true)
        } else if (justDragged) {
            // Reset after a short delay when drag ends
            const timer = setTimeout(() => setJustDragged(false), 200)
            return () => clearTimeout(timer)
        }
    }, [isDragging, justDragged])

    const handleClick = (e: React.MouseEvent) => {
        if (justDragged) {
            e.preventDefault()
            e.stopPropagation()
        }
    }

    // Find the deadline for the current step from ProjectStage
    const deadline = useMemo(() => {
        const currentStages = project.stages?.filter(s => s.stageNumber === project.currentStep) || []

        if (currentStages.length > 0) {
            const relevantStage = currentStages[currentStages.length - 1]
            return relevantStage.endDate ? new Date(relevantStage.endDate) : null
        }

        return null
    }, [project.stages, project.currentStep])

    const isLate = deadline ? new Date() > deadline : false

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn("mb-2 cursor-grab active:cursor-grabbing relative z-10", isDragging && "z-[9999]")}
        >
            <Link href={`/projects/${project.id}`} className="block" onClick={handleClick}>
                <Card className="hover:shadow-lg transition-all dark:bg-primary dark:text-primary-foreground dark:border-none overflow-hidden">
                    <div className="p-3 space-y-2">
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

                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground dark:text-primary-foreground/70 truncate">
                                {project.client.name}
                            </p>
                            <div className="text-right shrink-0">
                                <div className="text-[10px] text-muted-foreground dark:text-primary-foreground/60 uppercase tracking-wide font-medium">
                                    Entrega
                                </div>
                                <div className="text-sm font-bold tabular-nums">
                                    {deadline ? format(deadline, "dd/MM") : "—"}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
    )
}
