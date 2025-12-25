'use client'

import { useState } from 'react'
import { StageTemplateWithTasks, updateStageTemplate, createTaskTemplate, updateTaskTemplate, deleteTaskTemplate } from '@/app/(main)/admin/templates/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Collapsible,
    CollapsibleContent,
} from "@/components/ui/collapsible"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Plus, Trash2, Save, Clock, Zap } from 'lucide-react'
import { Role } from '@prisma/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'

interface StageEditorProps {
    stage: StageTemplateWithTasks
    onUpdate: () => void
}

export function StageEditor({ stage, onUpdate }: StageEditorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Stage State
    const [name, setName] = useState(stage.name)
    const [duration, setDuration] = useState(stage.durationDays || 0)
    const [trigger, setTrigger] = useState(stage.trigger || '')
    // const [kanbanColumn, setKanbanColumn] = useState(stage.kanbanColumn || '') // Hidden per user request

    const handleSaveStage = async () => {
        await updateStageTemplate(stage.id, {
            name,
            durationDays: duration,
            trigger,
            // kanbanColumn
        })
        setHasChanges(false)
        setIsEditing(false)
        onUpdate()
    }

    return (
        <Card className="border-l-4 border-l-primary/50 relative overflow-hidden transition-all hover:border-l-primary">
            <CardHeader className="pb-3 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                            {stage.stageNumber}
                        </div>
                        <div>
                            <CardTitle className="text-xl">{stage.name}</CardTitle>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {stage.durationDays || 0} dias</span>
                                {stage.trigger && <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {stage.trigger}</span>}
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{stage.tasks.length} tarefas</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Edit Name Button moved here? Or just expand? Collapsible is fine. */}
                        <Button variant="ghost" size="sm">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleContent>
                    <CardContent className="pt-0">
                        <div className="p-4 bg-muted/30 rounded-lg border mb-6 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Configurações da Etapa</h3>
                                {hasChanges && (
                                    <Button size="sm" onClick={handleSaveStage} className="gap-2">
                                        <Save className="w-4 h-4" /> Salvar Alterações
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome da Etapa</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setHasChanges(true) }}
                                    />
                                </div>
                                {/* Hidden Kanban Column Input
                                <div className="space-y-2">
                                    <Label>Coluna Kanban (ID)</Label>
                                    <Input 
                                        value={kanbanColumn} 
                                        onChange={(e) => { setKanbanColumn(e.target.value); setHasChanges(true) }} 
                                        placeholder="ex: step-2"
                                    />
                                </div>
                                */}
                                <div className="space-y-2">
                                    <Label>Duração Estimada (dias)</Label>
                                    <Input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => { setDuration(parseInt(e.target.value) || 0); setHasChanges(true) }}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Gatilho / Dependência</Label>
                                    <Input
                                        value={trigger}
                                        onChange={(e) => { setTrigger(e.target.value); setHasChanges(true) }}
                                        placeholder="O que inicia esta etapa?"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tarefas da Etapa</h3>

                                <NewTaskDialog stageId={stage.id} onUpdate={onUpdate} />

                            </div>

                            <div className="space-y-3">
                                {stage.tasks.map(task => (
                                    <TaskItem key={task.id} task={task} onUpdate={onUpdate} />
                                ))}
                                {stage.tasks.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                        Nenhuma tarefa configurada para esta etapa.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
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
    const [trigger, setTrigger] = useState('')

    const handleSubmit = async () => {
        if (!title) return
        setLoading(true)
        const result = await createTaskTemplate(stageId, {
            title,
            description,
            role,
            durationDays: duration,
            trigger
        })
        setLoading(false)

        if (result?.error) {
            alert(result.error)
            return
        }

        setOpen(false)

        // Reset form
        setTitle('')
        setDescription('')
        setTrigger('')
        setDuration(0)
        setRole('CRM')

        onUpdate()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Adicionar Tarefa
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
                    <div className="grid gap-2">
                        <Label htmlFor="trigger">Gatilho (Opcional)</Label>
                        <Input id="trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="Ex: Após etapa anterior" />
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

function TaskItem({ task, onUpdate }: { task: any, onUpdate: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || '')
    const [role, setRole] = useState<Role>(task.role)
    const [duration, setDuration] = useState(task.durationDays || 0)
    const [trigger, setTrigger] = useState(task.trigger || '')

    const handleSave = async () => {
        await updateTaskTemplate(task.id, {
            title,
            description,
            role,
            durationDays: duration,
            trigger
        })
        setHasChanges(false)
        setIsExpanded(false)
        onUpdate()
    }

    const handleDelete = async () => {
        if (confirm('Tem certeza que deseja excluir esta tarefa modelo?')) {
            await deleteTaskTemplate(task.id)
            onUpdate()
        }
    }

    return (
        <div className="border rounded-md bg-card transition-all">
            <div className="p-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>

                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-center">
                    <div>
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{task.description}</div>
                    </div>
                    <div className="flex gap-2 text-xs">
                        <Badge variant="secondary">{task.role}</Badge>
                        {task.durationDays > 0 && <Badge variant="outline">{task.durationDays}d</Badge>}
                    </div>
                </div>

                <div className="flex gap-1">
                    {hasChanges && (
                        <Button size="icon" variant="default" className="h-8 w-8" onClick={handleSave}>
                            <Save className="w-4 h-4" />
                        </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-3 pt-0 border-t bg-muted/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Título</Label>
                            <Input value={title} onChange={(e) => { setTitle(e.target.value); setHasChanges(true) }} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Responsável</Label>
                            <Select value={role} onValueChange={(v) => { setRole(v as Role); setHasChanges(true) }}>
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(Role).map(r => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs">Descrição</Label>
                            <Textarea value={description} onChange={(e) => { setDescription(e.target.value); setHasChanges(true) }} className="h-16 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Duração (dias)</Label>
                            <Input type="number" value={duration} onChange={(e) => { setDuration(parseInt(e.target.value) || 0); setHasChanges(true) }} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Gatilho (Opcional)</Label>
                            <Input value={trigger} onChange={(e) => { setTrigger(e.target.value); setHasChanges(true) }} className="h-8" placeholder="Ex: Após aprovação do cliente" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
