'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMemo } from 'react'
import FunnelNode from './briefing/funnel-node'
import FunnelGroupNode from './briefing/funnel-group-node'
import DeletableEdge from './briefing/deletable-edge'
import { useTheme } from 'next-themes'

interface SystemRow {
    application: string
    usage: string
}

interface BriefingData {
    companyContext?: string
    projectType?: string
    projectContext?: string
    systems?: SystemRow[]
    flowchartData?: {
        nodes: Node[]
        edges: Edge[]
    }
}

export function BriefingView({ data }: { data: BriefingData | null }) {
    const { theme } = useTheme()

    const nodeTypes = useMemo<NodeTypes>(() => ({
        funnel: FunnelNode,
        'funnel-group': FunnelGroupNode
    }), [])

    const edgeTypes = useMemo(() => ({
        deletable: DeletableEdge,
    }), [])

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>Nenhum briefing salvo para este projeto.</p>
            </div>
        )
    }

    const { companyContext, projectType, projectContext, systems, flowchartData } = data
    const nodes = flowchartData?.nodes || []
    const edges = flowchartData?.edges || []

    return (
        <div className="space-y-8">
            {/* 1. Contexto Geral */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Contexto Geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Contexto da Empresa</Label>
                        <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                            {companyContext || "Não preenchido"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Entrega</Label>
                        <div className="p-3 bg-muted rounded-md text-sm">
                            {projectType === "ia_closer_checkout" && "IA Closer + Checkout Digital"}
                            {projectType === "ia_crm" && "IA + CRM"}
                            {projectType === "crm" && "Apenas CRM"}
                            {!projectType && "Não selecionado"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Detalhes do Projeto</Label>
                        <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                            {projectContext || "Não preenchido"}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Sistemas Utilizados */}
            <Card>
                <CardHeader>
                    <CardTitle>2. Sistemas Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                    {systems && systems.length > 0 ? (
                        <div className="space-y-4">
                            {systems.map((row, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <Label className="text-xs text-muted-foreground">Aplicação</Label>
                                        <div className="p-2 bg-muted rounded-md text-sm">
                                            {row.application || "-"}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-xs text-muted-foreground">Uso</Label>
                                        <div className="p-2 bg-muted rounded-md text-sm">
                                            {row.usage || "-"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhum sistema cadastrado.</p>
                    )}
                </CardContent>
            </Card>

            {/* 3. Estrutura de CRM / Funil */}
            <Card>
                <CardHeader>
                    <CardTitle>3. Desenho do Funil</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[600px] border rounded-lg bg-gray-50 dark:bg-zinc-950/50 overflow-hidden">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                            className="bg-gray-50 dark:bg-zinc-950/50 cursor-default"
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            panOnScroll={false}
                            zoomOnScroll={true}
                        >
                            <Background
                                className="dark:bg-zinc-950/50"
                                color={theme === 'dark' ? '#52525b' : '#94a3b8'}
                                gap={16}
                            />
                            <Controls showInteractive={false} />
                        </ReactFlow>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
