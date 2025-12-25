'use client'

import { useState, useEffect } from "react"
import { DndContext, DragEndEvent, DragStartEvent, useDroppable, DragOverlay } from "@dnd-kit/core"
import { KanbanProject, updateProjectStatus } from "./actions"
import { ProjectCard } from "./project-card"
import { toast } from "sonner"

const COLUMNS = [
    { id: "onboarding", label: "1. Onboarding", step: 0 }, // Special status for projects in ONBOARDING
    { id: "step-2", label: "2. Validação", step: 2 },
    { id: "step-3", label: "3. Setup", step: 3 },
    { id: "step-4", label: "4. Desenv. Funis", step: 4 },
    { id: "step-5", label: "5. Go-Live", step: 5 },
    { id: "step-6", label: "6. Maturação", step: 6 },
    { id: "step-7", label: "7. Entrega Final", step: 7 },
    { id: "done", label: "Concluído", step: 8 },
]

interface KanbanBoardProps {
    initialProjects: KanbanProject[]
}

export function KanbanBoard({ initialProjects }: KanbanBoardProps) {
    const [projects, setProjects] = useState(initialProjects)
    const [activeProject, setActiveProject] = useState<KanbanProject | null>(null)

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        const project = projects.find(p => p.id === active.id)
        if (project) {
            setActiveProject(project)
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        setActiveProject(null)

        if (over && active.id !== over.id) {
            const projectId = active.id as string
            const columnId = over.id as string

            const column = COLUMNS.find(c => c.id === columnId)
            if (!column) return

            const project = projects.find(p => p.id === projectId)

            // Block movement if meeting is not scheduled (unless moving to onboarding)
            if (project && !project.meetingDate && columnId !== 'onboarding') {
                toast.error("Apresentação de esboços pendente", {
                    description: "O projeto não pode avançar de etapa até que a apresentação de esboços seja agendada pelo Product Owner."
                })
                return
            }

            // Optimistic Update
            setProjects(projects.map(p => {
                if (p.id === projectId) {
                    return {
                        ...p,
                        status: columnId === 'done' ? 'DONE' : (columnId === 'onboarding' ? 'ONBOARDING' : 'ACTIVE'),
                        currentStep: column.step
                    }
                }
                return p
            }))

            // Server Update
            try {
                const status = columnId === 'done' ? 'DONE' : (columnId === 'onboarding' ? 'ONBOARDING' : 'ACTIVE')
                const result = await updateProjectStatus(projectId, status, column.step)

                if (result.error) {
                    // Revert optimistic update
                    setProjects(projects)

                    toast.error("Não é possível mover o projeto", {
                        description: result.error
                    })
                    return
                }
            } catch (error) {
                console.error('Failed to update project status:', error)
                // Revert optimistic update on error
                setProjects(projects)
                toast.error("Erro ao atualizar projeto", {
                    description: "Ocorreu um erro ao mover o projeto. Tente novamente."
                })
            }
        }
    }

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        projects={projects.filter(p => {
                            if (col.id === 'onboarding') return p.status === 'ONBOARDING'
                            if (col.id === 'done') return p.status === 'DONE'
                            return p.currentStep === col.step && p.status !== 'ONBOARDING' && p.status !== 'DONE'
                        })}
                    />
                ))}
            </div>
        )
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        projects={projects.filter(p => {
                            if (col.id === 'onboarding') return p.status === 'ONBOARDING'
                            if (col.id === 'done') return p.status === 'DONE'
                            return p.currentStep === col.step && p.status !== 'ONBOARDING' && p.status !== 'DONE'
                        })}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeProject ? (
                    <div className="cursor-grabbing">
                        <ProjectCard project={activeProject} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

function KanbanColumn({ column, projects }: { column: typeof COLUMNS[0], projects: KanbanProject[] }) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    })

    return (
        <div ref={setNodeRef} className="min-w-[280px] w-[280px] bg-secondary rounded-lg p-3 flex flex-col">
            <h3 className="font-semibold text-sm mb-3 px-1">{column.label} <span className="text-muted-foreground ml-1 font-normal">({projects.length})</span></h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    )
}
