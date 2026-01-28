'use client'

import { useState, useEffect } from "react"
import { DndContext, DragEndEvent, DragStartEvent, useDroppable, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { KanbanProject, updateProjectStatus } from "./actions"
import { ProjectCard } from "./project-card"
import { toast } from "sonner"

interface StageTemplate {
    id: string
    name: string
    stageNumber: number
    kanbanColumn: string | null
}

interface KanbanBoardProps {
    initialProjects: KanbanProject[]
    templates: StageTemplate[]
}

export function KanbanBoard({ initialProjects, templates }: KanbanBoardProps) {
    const [projects, setProjects] = useState(initialProjects)
    const [activeProject, setActiveProject] = useState<KanbanProject | null>(null)

    // Configure sensors to avoid triggering drag on simple click
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 5, // 5px movement required to start dragging
        },
    })
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        },
    })
    const sensors = useSensors(mouseSensor, touchSensor)

    // Categorical columns
    const columns = [
        { id: "onboarding", label: "Onboarding", status: 'ONBOARDING' },
        { id: "desenvolvimento", label: "Desenvolvimento", status: 'ACTIVE' },
        { id: "otimizacao", label: "Otimização", status: 'ACTIVE' },
        { id: "manutencao", label: "Manutenção", status: 'ACTIVE' },
    ]

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

            const column = columns.find(c => c.id === columnId)
            if (!column) return

            const project = projects.find(p => p.id === projectId)
            if (!project) return

            // Map columnId to first step of that category
            let targetStep = project.currentStep
            if (columnId === 'onboarding') targetStep = 1
            else if (columnId === 'desenvolvimento') targetStep = 2
            else if (columnId === 'otimizacao') targetStep = 6
            else if (columnId === 'manutencao') targetStep = 7

            // 1. Check if the project is already in this column
            const isSameStep = project.currentStep === targetStep
            const isSameStatus = project.status === column.status

            // If it's dropped in exactly where it came from, do nothing (no server call)
            if (isSameStep && isSameStatus) {
                return
            }

            // Block movement if meeting is not scheduled (unless moving to onboarding)
            if (!project.meetingDate && columnId !== 'onboarding' && targetStep > 1) {
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
                        status: column.status,
                        currentStep: targetStep
                    }
                }
                return p
            }))

            // Server Update
            try {
                const result = await updateProjectStatus(projectId, column.status, targetStep)

                if (result.error) {
                    // Revert optimistic update
                    setProjects(projects)

                    toast.error("Não é possível mover o projeto", {
                        description: result.error
                    })
                    return
                }
            } catch (error) {
                if (error instanceof Error && error.message.includes('aborted')) {
                    console.log('Project move action aborted due to navigation.')
                    return
                }

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

    const renderBoard = () => {
        // Group templates by column
        const templatesByColumn = templates.reduce((acc, t) => {
            const col = t.kanbanColumn || 'other'
            if (!acc[col]) acc[col] = []
            acc[col].push(t.stageNumber)
            return acc
        }, {} as Record<string, number[]>)

        return (
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        projects={projects.filter(p => {
                            // Check if project's current step belongs to this column's stages
                            const stagesInCol = templatesByColumn[col.id] || []

                            // Special case for onboarding status
                            if (col.id === 'onboarding') {
                                return p.status === 'ONBOARDING' || (p.status === 'ACTIVE' && stagesInCol.includes(p.currentStep))
                            }

                            return p.status === 'ACTIVE' && stagesInCol.includes(p.currentStep)
                        })}
                    />
                ))}
            </div>
        )
    }

    if (!isMounted) {
        return renderBoard()
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {renderBoard()}
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

function KanbanColumn({ column, projects }: { column: { id: string, label: string, status: string }, projects: KanbanProject[] }) {
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
