'use client'

import { useState, useEffect, useRef } from 'react'
import { StageTemplateWithTasks, updateStageTemplate, createTaskTemplate, deleteStageTemplate, reorderTasks, deleteTaskTemplate, updateTaskTemplate } from '@/app/(main)/admin/templates/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, Save, GripVertical, Clock, Zap, User, AlertCircle } from 'lucide-react'
import { Role } from '@prisma/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface StageDetailProps {
    stage: StageTemplateWithTasks
    onUpdate: () => void
    onDelete: () => void
}

export function StageDetail({ stage, onUpdate, onDelete }: StageDetailProps) {
    const s = stage as any
    const [name, setName] = useState(s.name)
    const [duration, setDuration] = useState(s.durationDays || 0)
    const [isPerFunnel, setIsPerFunnel] = useState(s.isPerFunnel || false)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const nameInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setName(s.name)
        setDuration(s.durationDays || 0)
        setIsPerFunnel(s.isPerFunnel || false)
        setHasChanges(false)

        // Focus and select the name input when a new stage is selected
        setTimeout(() => {
            nameInputRef.current?.focus()
            nameInputRef.current?.select()
        }, 100)
    }, [s.id])

    const handleSaveStage = async () => {
        setIsSaving(true)
        const result = await updateStageTemplate(s.id, {
            name,
            durationDays: duration,
            isPerFunnel,
        })
        setIsSaving(false)
        if (result.success) {
            setHasChanges(false)
            toast.success('Etapa atualizada')
            onUpdate()
        } else {
            toast.error(result.error || 'Erro ao salvar')
        }
    }

    const handleDeleteStage = async () => {
        if (confirm(`Tem certeza que deseja excluir a etapa "${s.name}"? Todas as tarefas associadas serão removidas.`)) {
            const result = await deleteStageTemplate(s.id)
            if (result.success) {
                toast.success('Etapa removida')
                onDelete()
            } else {
                toast.error(result.error || 'Erro ao remover')
            }
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = stage.tasks.findIndex((t) => t.id === active.id)
            const newIndex = stage.tasks.findIndex((t) => t.id === over.id)

            const newTasks = arrayMove(stage.tasks, oldIndex, newIndex)

            // Optimistic update locally? We rely on onUpdate from parent which is called by the action revalidate
            const reorderData = newTasks.map((t, index) => ({
                id: t.id,
                order: index
            }))

            const result = await reorderTasks(reorderData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Tarefas reordenadas')
                onUpdate()
            }
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">{stage.name}</h2>
                    <p className="text-sm text-muted-foreground">Configurações e tarefas da etapa {stage.stageNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={handleDeleteStage}
                    >
                        <Trash2 className="w-4 h-4" />
                        Excluir Etapa
                    </Button>
                    {hasChanges && (
                        <Button
                            variant="default"
                            size="sm"
                            className="gap-2"
                            onClick={handleSaveStage}
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" /> Configuracões da Etapa
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Nome da Etapa</Label>
                            <Input
                                ref={nameInputRef}
                                value={name}
                                onChange={(e) => { setName(e.target.value); setHasChanges(true) }}
                                className={cn(
                                    "transition-all duration-500",
                                    !hasChanges && isSaving === false && "ring-2 ring-primary/20 animate-pulse border-primary/50"
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Duração Estimada (dias)</Label>
                            <Input
                                type="number"
                                value={duration}
                                onChange={(e) => { setDuration(parseInt(e.target.value) || 0); setHasChanges(true) }}
                            />
                        </div>
                        <div className="flex flex-col justify-center space-y-2">
                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="isPerFunnel"
                                    checked={isPerFunnel}
                                    onChange={(e) => { setIsPerFunnel(e.target.checked); setHasChanges(true) }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="isPerFunnel" className="cursor-pointer">Multiplicar por funil?</Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> Tarefas Padronizadas
                    </h3>
                    <NewTaskDialog stageId={s.id} onUpdate={onUpdate} />
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={(s.tasks || []).map((t: any) => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {(s.tasks || []).map((task: any) => (
                                <SortableTaskItem
                                    key={task.id}
                                    task={task}
                                    onUpdate={onUpdate}
                                />
                            ))}
                            {(s.tasks || []).length === 0 && (
                                <div className="text-center py-12 px-4 border border-dashed rounded-xl bg-muted/5">
                                    <AlertCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm font-medium">Nenhuma tarefa cadastrada nesta etapa.</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">As tarefas serão criadas automaticamente ao iniciar um novo projeto.</p>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    )
}

function SortableTaskItem({ task, onUpdate }: { task: any, onUpdate: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || '')
    const [role, setRole] = useState<Role>(task.role)
    const [duration, setDuration] = useState(task.durationDays || 0)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    }

    const handleSave = async () => {
        setIsSaving(true)
        const result = await updateTaskTemplate(task.id, {
            title,
            description,
            role,
            durationDays: duration,
        })
        setIsSaving(false)
        if (result.success) {
            setHasChanges(false)
            setIsExpanded(false)
            toast.success('Tarefa atualizada')
            onUpdate()
        } else {
            toast.error(result.error || 'Erro ao salvar tarefa')
        }
    }

    const handleDelete = async () => {
        if (confirm('Tem certeza que deseja excluir esta tarefa modelo?')) {
            const result = await deleteTaskTemplate(task.id)
            if (result.success) {
                toast.success('Tarefa removida')
                onUpdate()
            } else {
                toast.error(result.error || 'Erro ao remover')
            }
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group border rounded-xl bg-card transition-all hover:shadow-md",
                isDragging && "opacity-50 grayscale scale-95",
                isExpanded && "ring-1 ring-primary/20 bg-primary/5 shadow-inner"
            )}
        >
            <div className="p-3 sm:p-4 flex items-center gap-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer">
                        <div>
                            <h4 className="font-semibold text-sm sm:text-base">{task.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter sm:text-xs">
                                {task.role}
                            </Badge>
                            {task.durationDays > 0 && (
                                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                    <Clock className="w-2.5 h-2.5 mr-1" /> {task.durationDays}d
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {hasChanges && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary"
                            onClick={(e) => { e.stopPropagation(); handleSave() }}
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); handleDelete() }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="px-10 pb-4 text-sm animate-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t mt-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Título</Label>
                            <Input
                                value={title}
                                onChange={(e) => { setTitle(e.target.value); setHasChanges(true) }}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Responsável</Label>
                            <Select value={role} onValueChange={(v) => { setRole(v as Role); setHasChanges(true) }}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(Role).map(r => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs">Descrição</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => { setDescription(e.target.value); setHasChanges(true) }}
                                className="min-h-[80px]"
                                placeholder="Descreva os passos desta tarefa..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Duração Estimada (dias)</Label>
                            <Input
                                type="number"
                                value={duration}
                                onChange={(e) => { setDuration(parseInt(e.target.value) || 0); setHasChanges(true) }}
                                className="h-9"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function NewTaskDialog({ stageId, onUpdate }: { stageId: string, onUpdate: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [role, setRole] = useState<Role>('CRM')
    const [duration, setDuration] = useState(0)

    const handleSubmit = async () => {
        if (!title) return
        setLoading(true)
        const result = await createTaskTemplate(stageId, {
            title,
            description,
            role,
            durationDays: duration,
        })
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
            return
        }

        toast.success('Tarefa adicionada')
        setOpen(false)

        // Reset form
        setTitle('')
        setDescription('')
        setDuration(0)
        setRole('CRM')

        onUpdate()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                    <Plus className="w-4 h-4" /> Nova Tarefa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                    <DialogDescription>
                        Crie uma nova tarefa padrão para esta etapa.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Criar conta no CRM" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Responsável</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(Role).map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="duration">Duração (dias)</Label>
                            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={loading || !title}>
                        {loading ? 'Salvando...' : 'Criar Tarefa'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
