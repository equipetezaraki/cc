"use client"

import { useState } from "react"
import { Clock, Save, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProjectSettings } from "@/app/(main)/dashboard/actions"
import { toast } from "sonner"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface BusinessHoursSettingsProps {
    projectId: string
    initialStart: number
    initialEnd: number
    onRefresh: () => void
}

export function BusinessHoursSettings({ projectId, initialStart, initialEnd, onRefresh }: BusinessHoursSettingsProps) {
    const [start, setStart] = useState(initialStart)
    const [end, setEnd] = useState(initialEnd)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleSave = async () => {
        if (start < 0 || start > 23 || end < 0 || end > 23) {
            toast.error("Horários devem estar entre 0 e 23 horas")
            return
        }

        if (start >= end) {
            toast.error("Horário de início deve ser menor que o término")
            return
        }

        setLoading(true)
        try {
            await updateProjectSettings(projectId, {
                businessHoursStart: start,
                businessHoursEnd: end
            })
            toast.success("Horário de funcionamento atualizado")
            onRefresh()
            setOpen(false)
        } catch (error) {
            toast.error("Erro ao salvar configuração")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Expediente</span>
                    <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {start}h - {end}h
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Horário de Funcionamento</h4>
                        <p className="text-sm text-muted-foreground">
                            Defina o horário comercial para métricas de atendimento.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="start">Início</Label>
                            <Input
                                id="start"
                                type="number"
                                className="col-span-2 h-8"
                                min={0}
                                max={23}
                                value={start}
                                onChange={(e) => setStart(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="end">Fim</Label>
                            <Input
                                id="end"
                                type="number"
                                className="col-span-2 h-8"
                                min={0}
                                max={23}
                                value={end}
                                onChange={(e) => setEnd(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={loading} size="sm" className="w-full">
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
