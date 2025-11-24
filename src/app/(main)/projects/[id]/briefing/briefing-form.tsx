'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Save } from "lucide-react"
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    Connection,
    Edge,
    Node,
    useNodesState,
    useEdgesState,
    Panel,
    NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { saveBriefing } from './actions'
import { useTransition, useMemo, useEffect } from 'react'
import FunnelNode from './funnel-node'
import FunnelGroupNode from './funnel-group-node'
import DeletableEdge from './deletable-edge'
import { useTheme } from 'next-themes'


const initialNodes: Node[] = [
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Início do Funil' }, type: 'funnel' },
];

const initialEdges: Edge[] = [];

interface SystemRow {
    application: string
    usage: string
}

export function BriefingForm({ projectId, initialData }: { projectId: string, initialData: any }) {
    const [isPending, startTransition] = useTransition()
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Context State
    const [companyContext, setCompanyContext] = useState(initialData?.companyContext || "")
    const [projectType, setProjectType] = useState(initialData?.projectType || "ia_closer_checkout")
    const [projectContext, setProjectContext] = useState(initialData?.projectContext || "")

    // Systems State
    const [systems, setSystems] = useState<SystemRow[]>(initialData?.systems || [{ application: "", usage: "" }])

    // Flowchart State
    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.flowchartData?.nodes || initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.flowchartData?.edges || initialEdges)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [nodeName, setNodeName] = useState("")

    // Helper to update group dimensions based on children
    const updateGroupDimensions = useCallback((groupId: string, currentNodes: Node[]) => {
        const groupNodes = currentNodes.filter(n => n.parentNode === groupId);
        if (groupNodes.length === 0) return;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        groupNodes.forEach(node => {
            const nodeWidth = node.width || 180; // Estimate if not set
            const nodeHeight = node.height || 80;
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + nodeWidth);
            maxY = Math.max(maxY, node.position.y + nodeHeight);
        });

        const padding = 50; // Breathing room
        const width = maxX - minX + (padding * 2);
        const height = maxY - minY + (padding * 2);

        // We need to adjust the group's position if the children expand left/up
        // But in React Flow, child positions are relative to parent. 
        // So if we change parent size, we might need to adjust parent position and child positions?
        // Actually, simpler approach: Just resize the group to fit the content relative to 0,0 of the group?
        // No, child positions are relative. 
        // Let's assume the group position stays fixed for now and we just expand width/height.
        // But if a node is dragged to negative coordinates relative to group, it's clipped?
        // React Flow handles extent='parent'. 
        // If we want dynamic resizing, we should probably let the group grow.

        setNodes(nds => nds.map(n => {
            if (n.id === groupId) {
                return {
                    ...n,
                    style: { ...n.style, width: Math.max(width, 400), height: Math.max(height, 300) }
                };
            }
            return n;
        }));
    }, [setNodes]);

    const handleAddConnectedStage = useCallback((sourceId: string, direction: 'top' | 'right' | 'bottom' | 'left') => {
        setNodes((nds) => {
            const sourceNode = nds.find(n => n.id === sourceId);
            if (!sourceNode) return nds;

            const newId = Math.random().toString();
            let position = { x: 0, y: 0 };
            const offset = 200;

            // Calculate new position based on direction
            if (direction === 'top') position = { x: sourceNode.position.x, y: sourceNode.position.y - offset };
            if (direction === 'right') position = { x: sourceNode.position.x + offset + 50, y: sourceNode.position.y };
            if (direction === 'bottom') position = { x: sourceNode.position.x, y: sourceNode.position.y + offset };
            if (direction === 'left') position = { x: sourceNode.position.x - offset - 50, y: sourceNode.position.y };

            const newNode: Node = {
                id: newId,
                position,
                data: {
                    label: 'Nova Etapa',
                    onAddConnectedStage: handleAddConnectedStage
                },
                type: 'funnel',
                parentNode: sourceNode.parentNode, // Keep in same group
                extent: 'parent'
            };

            // Connect them
            const newEdge: Edge = {
                id: `e${sourceId}-${newId}`,
                source: sourceId,
                target: newId,
                sourceHandle: `${direction}-source`,
                targetHandle:
                    direction === 'top' ? 'bottom-target' :
                        direction === 'bottom' ? 'top-target' :
                            direction === 'left' ? 'right-target' :
                                'left-target',
                type: 'deletable'
            };

            setEdges((eds) => [...eds, newEdge]);

            // If inside a group, we might need to resize it next tick
            if (sourceNode.parentNode) {
                setTimeout(() => updateGroupDimensions(sourceNode.parentNode as string, [...nds, newNode]), 0);
            }

            return [...nds, newNode];
        });
    }, [setNodes, setEdges, updateGroupDimensions]);

    // Update existing nodes to have the callback
    useEffect(() => {
        setNodes((nds) => nds.map(n => {
            if (n.type === 'funnel' && !n.data.onAddConnectedStage) {
                return {
                    ...n,
                    data: { ...n.data, onAddConnectedStage: handleAddConnectedStage }
                };
            }
            return n;
        }));
    }, [handleAddConnectedStage, setNodes]);

    const nodeTypes = useMemo<NodeTypes>(() => ({
        funnel: FunnelNode,
        'funnel-group': FunnelGroupNode
    }), [])

    const edgeTypes = useMemo(() => ({
        deletable: DeletableEdge,
    }), []);

    const isValidConnection = useCallback((connection: Connection) => {
        // Only allow connection if both source and target exist and are different nodes
        if (!connection.source || !connection.target) return false;
        if (connection.source === connection.target) return false;

        // Check if both nodes actually exist in the nodes array
        const sourceExists = nodes.some(n => n.id === connection.source);
        const targetExists = nodes.some(n => n.id === connection.target);

        return sourceExists && targetExists;
    }, [nodes]);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'deletable' }, eds)), [setEdges])

    const onNodeDragStop = useCallback((_: any, node: Node) => {
        if (node.parentNode) {
            // We need current nodes state to calculate dimensions
            setNodes(currentNodes => {
                updateGroupDimensions(node.parentNode as string, currentNodes);
                return currentNodes;
            });
        }
    }, [updateGroupDimensions, setNodes]);

    const onNodesDelete = useCallback((deleted: Node[]) => {
        const deletedIds = new Set(deleted.map(n => n.id));
        setEdges((eds) => eds.filter((edge) =>
            !deletedIds.has(edge.source) && !deletedIds.has(edge.target)
        ));
    }, [setEdges]);

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNodeId(node.id)
        setNodeName(node.data.label)
    }, [])

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null)
        setNodeName("")
    }, [])

    const handleAddNode = () => {
        const id = Math.random().toString()
        const newNode: Node = {
            id,
            position: { x: 100, y: 100 },
            data: { label: 'Nova Etapa' },
            type: 'funnel'
        }
        setNodes((nds) => nds.concat(newNode))
    }

    const handleAddFunnel = () => {
        const groupId = Math.random().toString()
        const groupNode: Node = {
            id: groupId,
            position: { x: 50, y: 50 },
            data: {
                label: 'Novo Funil',
            },
            type: 'funnel-group',
            style: { width: 400, height: 300 },
            zIndex: -1
        }

        // Add initial stage inside the group
        const stageId = Math.random().toString()
        const initialStage: Node = {
            id: stageId,
            position: { x: 50, y: 80 },
            data: {
                label: 'Início',
                onAddConnectedStage: handleAddConnectedStage
            },
            type: 'funnel',
            parentNode: groupId,
            extent: 'parent'
        }

        setNodes((nds) => [...nds, groupNode, initialStage])
    }

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNodeName(e.target.value)
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: e.target.value,
                        },
                    }
                }
                return node
            })
        )
    }

    // Removed handleColorChange and COLORS as they are now in FunnelNode


    // Systems Handlers
    const addSystemRow = () => {
        setSystems([...systems, { application: "", usage: "" }])
    }

    const removeSystemRow = (index: number) => {
        const newSystems = systems.filter((_, i) => i !== index)
        setSystems(newSystems)
    }

    const updateSystemRow = (index: number, field: keyof SystemRow, value: string) => {
        const newSystems = [...systems]
        newSystems[index][field] = value
        setSystems(newSystems)
    }

    // Save Handler
    const handleSave = () => {
        startTransition(async () => {
            const data = {
                companyContext,
                projectType,
                projectContext,
                systems,
                flowchartData: { nodes, edges }
            }
            await saveBriefing(projectId, data)
        })
    }

    if (!mounted) return null

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
                        <Textarea
                            placeholder="Descreva o negócio do cliente, público-alvo, dores, etc."
                            value={companyContext}
                            onChange={(e) => setCompanyContext(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Entrega</Label>
                        <RadioGroup value={projectType} onValueChange={setProjectType} className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ia_closer_checkout" id="r1" />
                                <Label htmlFor="r1">IA Closer + Checkout Digital</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ia_crm" id="r2" />
                                <Label htmlFor="r2">IA + CRM</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="crm" id="r3" />
                                <Label htmlFor="r3">Apenas CRM</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label>Detalhes do Projeto</Label>
                        <Textarea
                            placeholder="Descreva o que será entregue com mais detalhes..."
                            value={projectContext}
                            onChange={(e) => setProjectContext(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 2. Sistemas Utilizados */}
            <Card>
                <CardHeader>
                    <CardTitle>2. Sistemas Utilizados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {systems.map((row, index) => (
                        <div key={index} className="flex gap-4 items-start">
                            <div className="flex-1">
                                <Input
                                    placeholder="Aplicação (Ex: RD Station)"
                                    value={row.application}
                                    onChange={(e) => updateSystemRow(index, 'application', e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    placeholder="Para que é usada (Ex: Captura de Leads)"
                                    value={row.usage}
                                    onChange={(e) => updateSystemRow(index, 'usage', e.target.value)}
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeSystemRow(index)} disabled={systems.length === 1}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addSystemRow} className="gap-2">
                        <Plus className="h-4 w-4" /> Adicionar Sistema
                    </Button>
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
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            isValidConnection={isValidConnection}
                            onNodeClick={onNodeClick}
                            onNodeDragStop={onNodeDragStop}
                            onNodesDelete={onNodesDelete}
                            onPaneClick={onPaneClick}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                            className="bg-gray-50 dark:bg-zinc-950/50 cursor-default"
                            connectionRadius={100}
                            connectOnClick={false}
                            panOnDrag={[1, 2]}
                            panActivationKeyCode="Shift"
                            selectionOnDrag={true}
                            multiSelectionKeyCode="Control"
                            panOnScroll={false}
                            zoomOnScroll={true}
                            deleteKeyCode={['Delete', 'Backspace']}
                        >
                            <Background
                                className="dark:bg-zinc-950/50"
                                color={theme === 'dark' ? '#52525b' : '#94a3b8'}
                                gap={16}
                            />
                            <Controls showInteractive={false} />
                            <Panel position="top-right" className="bg-background/90 p-2 rounded-lg border shadow-sm backdrop-blur-sm flex flex-col gap-2">
                                <div className="flex flex-col gap-2">
                                    <Button size="sm" onClick={handleAddFunnel} className="w-full gap-2">
                                        <Plus className="h-4 w-4" /> Novo Funil
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleAddNode} className="w-full gap-2">
                                        <Plus className="h-4 w-4" /> Etapa Solta
                                    </Button>

                                    {selectedNodeId && (
                                        <div className="space-y-2 pt-2 border-t">
                                            <Label className="text-xs">Nome da Etapa</Label>
                                            <Input
                                                value={nodeName}
                                                onChange={handleLabelChange}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </Panel>
                        </ReactFlow>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Arraste nós para desenhar o fluxo. Use os controles para zoom.
                    </p>
                </CardContent>
            </Card>

            <div className="flex justify-end pb-12">
                <Button size="lg" onClick={handleSave} disabled={isPending} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isPending ? "Salvando..." : "Salvar Briefing"}
                </Button>
            </div>
        </div>
    )
}
