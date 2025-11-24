import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, useReactFlow } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function DeletableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
}: EdgeProps) {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = (evt: React.MouseEvent, id: string) => {
        evt.stopPropagation();
        setEdges((edges) => edges.filter((e) => e.id !== id));
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <Button
                        variant="destructive"
                        size="icon"
                        className={`w-6 h-6 rounded-full opacity-0 hover:opacity-100 transition-opacity ${selected ? 'opacity-100' : ''} group-hover:opacity-100`}
                        onClick={(event) => onEdgeClick(event, id)}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
