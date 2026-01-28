'use client'

import { useState, useTransition, useCallback, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, addDays } from "date-fns"
import { CalendarIcon, Loader2, Plus, Trash2, Save } from "lucide-react"
import { useTheme } from 'next-themes'

import { cn } from "@/lib/utils"
import { addBusinessDays } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { onboardingSchema, OnboardingFormValues } from "@/lib/schemas"
import { submitBriefing } from "./actions"

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
import FunnelNode from '@/components/briefing/funnel-node'
import FunnelGroupNode from '@/components/briefing/funnel-group-node'
import DeletableEdge from '@/components/briefing/deletable-edge'

const initialNodes: Node[] = [
    { id: '1', position: { x: 280, y: 0 }, data: { label: 'Início do Funil' }, type: 'funnel' },
];

const initialEdges: Edge[] = [];

interface SystemRow {
    application: string
    usage: string
}

export function OnboardingForm() {
    const [isPending, startTransition] = useTransition()
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema) as any,
        defaultValues: {
            clientName: "",
            email: "",
            companyName: "",
            phone: "",
            projectName: "",
            funnelCount: 1,
            segment: "",
            operationSize: "Pequena",
            projectType: "Tezaraki Essential",
            technicalBriefingUrl: "",
        },
    })

    // Watch values to update Go-Live Date
    const projectType = form.watch("projectType")
    const funnelCount = form.watch("funnelCount")

    // Calculate Go-Live Date
    const goLiveDateResult = useMemo(() => {
        const today = new Date()
        let date = today
        let hint = ""

        if (projectType === 'Tezaraki Essential') {
            date = addDays(today, 30)
            hint = "+30 dias corridos"
        } else if (projectType === 'Tezaraki Pro') {
            // 30 days calendar + 5 business days per extra funnel
            const baseDate = addDays(today, 30)
            const extraFunnels = Math.max(0, funnelCount - 1)
            const extraBusinessDays = extraFunnels * 5

            if (extraBusinessDays > 0) {
                date = addBusinessDays(baseDate, extraBusinessDays)
                hint = `+30 dias corridos + ${extraBusinessDays} dias úteis`
            } else {
                date = baseDate
                hint = "+30 dias corridos"
            }
        } else if (projectType === 'Tezaraki Private') {
            date = addDays(today, 90)
            hint = "+90 dias de implementação"
        }

        return {
            formattedDate: format(date, 'dd/MM/yyyy'),
            hint
        }
    }, [projectType, funnelCount])

    // Flowchart State
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [nodeName, setNodeName] = useState("")

    // --- Flowchart Helpers (Copied from BriefingForm) ---
    const updateGroupDimensions = useCallback((groupId: string, currentNodes: Node[]) => {
        const groupNodes = currentNodes.filter(n => n.parentNode === groupId);
        if (groupNodes.length === 0) return;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        groupNodes.forEach(node => {
            const nodeWidth = node.width || 180;
            const nodeHeight = node.height || 80;
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + nodeWidth);
            maxY = Math.max(maxY, node.position.y + nodeHeight);
        });

        const padding = 50;
        const width = maxX - minX + (padding * 2);
        const height = maxY - minY + (padding * 2);

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

            if (direction === 'top') position = { x: sourceNode.position.x, y: sourceNode.position.y - offset };
            if (direction === 'right') position = { x: sourceNode.position.x + offset + 80, y: sourceNode.position.y };
            if (direction === 'bottom') position = { x: sourceNode.position.x, y: sourceNode.position.y + offset };
            if (direction === 'left') position = { x: sourceNode.position.x - offset - 80, y: sourceNode.position.y };

            const newNode: Node = {
                id: newId,
                position,
                data: {
                    label: 'Nova Etapa',
                    onAddConnectedStage: handleAddConnectedStage
                },
                type: 'funnel',
                parentNode: sourceNode.parentNode,
                extent: 'parent'
            };

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

            if (sourceNode.parentNode) {
                setTimeout(() => updateGroupDimensions(sourceNode.parentNode as string, [...nds, newNode]), 0);
            }

            return [...nds, newNode];
        });
    }, [setNodes, setEdges, updateGroupDimensions]);

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
        if (!connection.source || !connection.target) return false;
        if (connection.source === connection.target) return false;
        const sourceExists = nodes.some(n => n.id === connection.source);
        const targetExists = nodes.some(n => n.id === connection.target);
        return sourceExists && targetExists;
    }, [nodes]);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'deletable' }, eds)), [setEdges])

    const onNodeDragStop = useCallback((_: any, node: Node) => {
        if (node.parentNode) {
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
            position: { x: 120, y: 120 },
            data: { label: 'Nova Etapa' },
            type: 'funnel'
        }
        setNodes((nds) => nds.concat(newNode))
    }

    const handleAddFunnel = () => {
        const groupId = Math.random().toString()
        const groupNode: Node = {
            id: groupId,
            position: { x: 80, y: 80 },
            data: {
                label: 'Novo Funil',
            },
            type: 'funnel-group',
            style: { width: 400, height: 300 },
            zIndex: -1
        }

        const stageId = Math.random().toString()
        const initialStage: Node = {
            id: stageId,
            position: { x: 40, y: 40 },
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



    function onSubmit(data: OnboardingFormValues) {
        startTransition(async () => {
            // Sanitize nodes
            const sanitizedNodes = nodes.map(node => {
                const { data, ...rest } = node;
                const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
                    if (typeof value !== 'function') {
                        acc[key] = value;
                    }
                    return acc;
                }, {} as Record<string, any>);
                return { ...rest, data: cleanData };
            });

            const fullData = {
                ...data,
                flowchartData: {
                    nodes: sanitizedNodes,
                    edges
                }
            }

            const result = await submitBriefing(fullData)
            if (result?.error) {
                alert(result.error)
            }
        })
    }

    if (!mounted) return null

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Dados do Cliente</h3>

                        <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Cliente</FormLabel>
                                    <FormControl>
                                        <Input placeholder="João Silva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email do Cliente</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="cliente@exemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefone (55 + DDD + Número)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="5511999999999" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Apenas números. Ex: 5527999492205
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Empresa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Inc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Strategic & Project Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Classificação e Projeto</h3>

                        <FormField
                            control={form.control}
                            name="projectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Projeto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Implementação CRM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="funnelCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantidade de Funis</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} max={10} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormDescription>
                                        Número de funis contratados.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="segment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Segmento do Negócio</FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...field}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Clínica">Clínica</option>
                                            <option value="E-commerce">E-commerce</option>
                                            <option value="Serviços">Serviços</option>
                                            <option value="Imobiliária">Imobiliária</option>
                                            <option value="Educação">Educação</option>
                                            <option value="Varejo">Varejo</option>
                                            <option value="Atacado">Atacado</option>
                                            <option value="Atacado e Varejo">Atacado e Varejo</option>
                                            <option value="Indústria">Indústria</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="operationSize"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Tamanho da Operação</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Pequena" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Pequena (R$ 100k/mês &lt; x &lt; R$ 500k/mês)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Média" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Média (R$ 500k/mês &lt; x &lt; R$ 1MM/mês)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Grande" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Grande (R$ 1MM/mês+)
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="projectType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Tipo de Projeto</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Tezaraki Essential" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Tezaraki Essential (30 dias corridos)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Tezaraki Pro" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Tezaraki Pro (30 dias + 5 dias úteis por funil extra)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Tezaraki Private" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Tezaraki Private (90 dias)
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Responsáveis e Datas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                    <div className="space-y-2">
                        <Label>Comercial Responsável</Label>
                        <Input value="Eu (Auto)" disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Data de Fechamento</Label>
                        <Input value={format(new Date(), 'dd/MM/yyyy')} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Data Prevista de Go-Live</Label>
                        <Input value={goLiveDateResult.formattedDate} disabled />
                        <p className="text-xs text-muted-foreground">{goLiveDateResult.hint}</p>
                    </div>
                </div>

                {/* Technical Briefing Sections */}
                <div className="space-y-8 pt-6 border-t">
                    <h2 className="text-2xl font-bold">Briefing Técnico</h2>

                    {/* 1. Contexto Geral */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Link do Documento de Briefing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="technicalBriefingUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link do Google Docs</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://docs.google.com/document/d/..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Anexe o link do documento de briefing técnico preenchido.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* 3. Estrutura de CRM / Funil */}
                    <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none flex flex-col" : ""}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>3. Desenho do Funil</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                                {isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                            </Button>
                        </CardHeader>
                        <CardContent className={isFullscreen ? "flex-1 p-0" : ""}>
                            <div className={`${isFullscreen ? "h-full" : "h-[600px]"} border rounded-lg bg-gray-50 dark:bg-zinc-950/50 overflow-hidden`}>
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
                                    snapToGrid={true}
                                    snapGrid={[20, 20]}
                                >
                                    <Background
                                        className="dark:bg-zinc-950/50"
                                        color={theme === 'dark' ? '#52525b' : '#94a3b8'}
                                        gap={20}
                                    />
                                    <Controls showInteractive={false} />
                                    <Panel position="top-right" className="bg-background/90 p-2 rounded-lg border shadow-sm backdrop-blur-sm flex flex-col gap-2">
                                        <div className="flex flex-col gap-2">
                                            <Button type="button" size="sm" onClick={handleAddFunnel} className="w-full gap-2">
                                                <Plus className="h-4 w-4" /> Novo Funil
                                            </Button>
                                            <Button type="button" size="sm" variant="outline" onClick={handleAddNode} className="w-full gap-2">
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
                            {!isFullscreen && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Arraste nós para desenhar o fluxo. Use os controles para zoom.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Criando Projeto..." : "Iniciar Projeto"}
                </Button>
            </form>
        </Form >
    )
}

