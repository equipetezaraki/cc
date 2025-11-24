'use client'

import { useState } from "react"
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core"
import { KanbanProject, updateProjectStatus } from "./actions"
import { ProjectCard } from "./project-card"

const COLUMNS = [
    { id: "onboarding", label: "Onboarding", step: 0 }, // Special status
    { id: "step-1", label: "1. Definição", step: 1 },
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

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const projectId = active.id as string
            const columnId = over.id as string

            const column = COLUMNS.find(c => c.id === columnId)
            if (!column) return

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
            const status = columnId === 'done' ? 'DONE' : (columnId === 'onboarding' ? 'ONBOARDING' : 'ACTIVE')
            await updateProjectStatus(projectId, status, column.step)
        }
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
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
            <div className="flex-1 space-y-3">
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    )
}
