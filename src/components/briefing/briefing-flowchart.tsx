'use client'

import { useMemo } from 'react'
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Node,
    NodeTypes,
    useNodesState,
    useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useTheme } from 'next-themes'
import FunnelNode from './funnel-node'
import FunnelGroupNode from './funnel-group-node'
import DeletableEdge from './deletable-edge'

interface BriefingFlowchartProps {
    initialNodes: Node[]
    initialEdges: Edge[]
    readOnly?: boolean
}

export function BriefingFlowchart({ initialNodes, initialEdges, readOnly = false }: BriefingFlowchartProps) {
    const { theme } = useTheme()

    // We use local state even for read-only to allow internal React Flow interactions (like expanding groups if implemented)
    // But for strict read-only where we just display, we might not need to handle changes.
    // However, React Flow expects onNodesChange/onEdgesChange to handle internal state updates (like selection).
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const nodeTypes = useMemo<NodeTypes>(() => ({
        funnel: FunnelNode,
        'funnel-group': FunnelGroupNode
    }), [])

    const edgeTypes = useMemo(() => ({
        deletable: DeletableEdge,
    }), [])

    return (
        <div className="h-full w-full border rounded-lg bg-gray-50 dark:bg-zinc-950/50 overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={readOnly ? undefined : onNodesChange}
                onEdgesChange={readOnly ? undefined : onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                className="bg-gray-50 dark:bg-zinc-950/50 cursor-default"
                connectionRadius={100}
                connectOnClick={!readOnly}
                panOnDrag={[1, 2]}
                panActivationKeyCode="Shift"
                selectionOnDrag={!readOnly}
                multiSelectionKeyCode="Control"
                panOnScroll={false}
                zoomOnScroll={true}
                nodesDraggable={!readOnly}
                nodesConnectable={!readOnly}
                elementsSelectable={!readOnly}
                snapToGrid={true}
                snapGrid={[20, 20]}
            >
                <Background
                    className="dark:bg-zinc-950/50"
                    color={theme === 'dark' ? '#52525b' : '#94a3b8'}
                    gap={20}
                    size={1}
                />
                <Controls showInteractive={!readOnly} />
            </ReactFlow>
        </div>
    )
}
