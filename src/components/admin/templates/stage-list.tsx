'use client'

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StageTemplateWithTasks, reorderStages } from '@/app/(main)/admin/templates/actions'
import { cn } from '@/lib/utils'
import { GripVertical, Clock, Zap, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface StageListProps {
    stages: StageTemplateWithTasks[]
    selectedStageId: string | null
    onSelect: (id: string) => void
    onReorder: (newStages: StageTemplateWithTasks[]) => void
}

export function StageList({ stages, selectedStageId, onSelect, onReorder }: StageListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = stages.findIndex((s) => s.id === active.id)
            const newIndex = stages.findIndex((s) => s.id === over.id)

            const newStages = arrayMove(stages, oldIndex, newIndex)
            onReorder(newStages)

            // Update in DB
            const reorderData = newStages.map((s, index) => ({
                id: s.id,
                stageNumber: index + 1
            }))

            const result = await reorderStages(reorderData)
            if (result.error) {
                toast.error(result.error)
                // Revert? Not strictly necessary for this UX but good to have
            } else {
                toast.success('Etapas reordenadas')
            }
        }
    }

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={stages.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {stages.map((stage) => (
                            <SortableStageItem
                                key={stage.id}
                                stage={stage}
                                isSelected={selectedStageId === stage.id}
                                onSelect={() => onSelect(stage.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}

function SortableStageItem({ stage, isSelected, onSelect }: { stage: StageTemplateWithTasks, isSelected: boolean, onSelect: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: stage.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                isSelected
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border hover:bg-muted/50",
                isDragging && "opacity-50 grayscale"
            )}
            onClick={onSelect}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
                <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                        {stage.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] tabular-nums opacity-30 mt-0.5">
                            #{String(stage.stageNumber).padStart(2, '0')}
                        </span>
                        <Pencil className={cn(
                            "w-3 h-3 transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                        )} />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-2 font-medium">
                    <span className="flex items-center gap-1.5 bg-muted/50 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-primary/70" /> {stage.durationDays} dias
                    </span>
                    <span className="flex items-center gap-1.5 bg-muted/50 px-1.5 py-0.5 rounded">
                        <Zap className="w-3 h-3 text-primary/70" /> {(stage as any).tasks?.length || 0} tarefas
                    </span>
                </div>
            </div>
        </div>
    )
}
