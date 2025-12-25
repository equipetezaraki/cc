'use client'

import { useState, useEffect } from 'react'
import { getTemplates, StageTemplateWithTasks } from './actions'
import { StageEditor } from '@/components/admin/stage-editor'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createStageTemplate } from './actions'

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<StageTemplateWithTasks[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        const data = await getTemplates()
        setTemplates(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreateStage = async () => {
        // Simple prompt or modal for creating a new stage (quick addition)
        // For a better UX, we could use a Dialog. For now, let's just add one at the end.
        const nextStageNumber = templates.length > 0 ? Math.max(...templates.map(t => t.stageNumber)) + 1 : 1
        await createStageTemplate({ name: `Nova Etapa ${nextStageNumber}`, stageNumber: nextStageNumber })
        fetchData()
    }

    if (loading) {
        return <div className="p-8 text-center">Carregando templates...</div>
    }

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Modelos de Etapas e Tarefas</h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie as etapas padrão e tarefas que serão criadas para novos projetos.
                    </p>
                </div>
                <Button onClick={handleCreateStage} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Etapa
                </Button>
            </div>

            <div className="space-y-6">
                {templates.map((stage) => (
                    <StageEditor
                        key={stage.id}
                        stage={stage}
                        onUpdate={fetchData}
                    />
                ))}
            </div>
        </div>
    )
}
