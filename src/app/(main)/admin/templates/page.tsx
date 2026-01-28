'use client'

import { useState, useEffect } from 'react'
import { getTemplates, StageTemplateWithTasks, createStageTemplate } from './actions'
import { StageList } from '@/components/admin/templates/stage-list'
import { StageDetail } from '@/components/admin/templates/stage-detail'
import { Button } from '@/components/ui/button'
import { Plus, LayoutTemplate, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<StageTemplateWithTasks[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchData = async () => {
        setLoading(true)
        const data = await getTemplates()
        setTemplates(data)

        // Auto-select first if none selected
        if (data.length > 0 && !selectedId) {
            setSelectedId(data[0].id)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreateStage = async () => {
        const nextStageNumber = templates.length > 0 ? Math.max(...templates.map(t => t.stageNumber)) + 1 : 1
        const result = await createStageTemplate({
            name: `Nova Etapa ${nextStageNumber}`,
            stageNumber: nextStageNumber
        })

        if (result.success) {
            toast.success('Etapa criada')
            // Refresh and select the new one?
            const data = await getTemplates()
            setTemplates(data)
            const newStage = data.find(s => s.stageNumber === nextStageNumber)
            if (newStage) setSelectedId(newStage.id)
        } else {
            toast.error(result.error || 'Erro ao criar etapa')
        }
    }

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedStage = templates.find(t => t.id === selectedId)

    if (loading && templates.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando modelos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <LayoutTemplate className="w-8 h-8 text-primary" />
                        Modelos de Gestão
                    </h1>
                    <p className="text-muted-foreground">
                        Defina a sequência padrão de etapas e tarefas para seus projetos.
                    </p>
                </div>
                <Button onClick={handleCreateStage} className="gap-2 shadow-sm">
                    <Plus className="w-4 h-4" />
                    Nova Etapa
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 flex-1 overflow-hidden">
                {/* Sidebar - Stage List */}
                <div className="flex flex-col gap-4 overflow-hidden border-r h-full">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar etapa..."
                            className="pl-9 h-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="flex-1 h-0 pr-4">
                        <StageList
                            stages={filteredTemplates}
                            selectedStageId={selectedId}
                            onSelect={setSelectedId}
                            onReorder={(newStages) => setTemplates(newStages)}
                        />
                    </ScrollArea>
                </div>

                {/* Main Content - Stage Detail */}
                <div className="overflow-hidden flex flex-col h-full">
                    <ScrollArea className="flex-1 h-0 pr-4">
                        {selectedStage ? (
                            <StageDetail
                                stage={selectedStage}
                                onUpdate={fetchData}
                                onDelete={() => {
                                    setSelectedId(null)
                                    fetchData()
                                }}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/5 rounded-2xl border border-dashed">
                                <LayoutTemplate className="w-12 h-12 text-muted-foreground/20 mb-4" />
                                <h3 className="font-semibold text-lg">Nenhuma etapa selecionada</h3>
                                <p className="text-muted-foreground max-w-xs">
                                    Selecione uma etapa na lista lateral para editar suas configurações e tarefas.
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}
