import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeToolbar, useReactFlow } from 'reactflow';
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const COLORS = [
    { label: 'Padrão', value: '' },
    { label: 'Vermelho', value: '#fee2e2' },
    { label: 'Verde', value: '#dcfce7' },
    { label: 'Azul', value: '#dbeafe' },
    { label: 'Amarelo', value: '#fef9c3' },
    { label: 'Roxo', value: '#f3e8ff' },
    { label: 'Laranja', value: '#ffedd5' },
    { label: 'Cinza', value: '#f4f4f5' },
    { label: 'Escuro', value: '#18181b' },
];

const FunnelNode = ({ id, data, selected }: NodeProps) => {
    const { setNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [labelText, setLabelText] = useState(data.label);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLabelText(data.label);
    }, [data.label]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleColorChange = (color: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            color: color,
                        },
                    };
                }
                return node;
            })
        );
    };

    const handleLabelSubmit = () => {
        setIsEditing(false);
        if (labelText !== data.label) {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: labelText,
                            },
                        };
                    }
                    return node;
                })
            );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelSubmit();
        }
    };

    const getTextColor = (bgColor: string) => {
        if (!bgColor) return 'inherit';
        if (bgColor === '#18181b') return 'white';
        return 'black';
    };

    const textColor = getTextColor(data.color);

    // Helper to render a "+" button near a handle
    const AddButton = ({ position, onClick, className }: { position: Position, onClick: () => void, className?: string }) => (
        <div
            className={cn(
                "absolute opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200 z-50",
                className
            )}
            style={{ pointerEvents: 'auto' }}
            onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick();
            }}
        >
            <button
                className="bg-primary text-primary-foreground rounded-full p-0.5 shadow-md hover:scale-110 transition-transform w-5 h-5 flex items-center justify-center"
                onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onClick();
                }}
                title="Adicionar etapa"
            >
                <Plus className="w-3 h-3" />
            </button>
        </div>
    );

    return (
        <div className="group relative">
            <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-1 bg-background/95 p-2 rounded-lg border shadow-sm backdrop-blur-sm">
                {COLORS.map((color) => (
                    <button
                        key={color.value || 'default'}
                        className={cn(
                            "w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center",
                            color.value === '' ? 'bg-card' : ''
                        )}
                        style={{ backgroundColor: color.value }}
                        onClick={() => handleColorChange(color.value)}
                        title={color.label}
                    >
                        {data.color === color.value && (
                            <Check className={cn("w-3 h-3", color.value === '#18181b' ? "text-white" : "text-black")} />
                        )}
                    </button>
                ))}
            </NodeToolbar>

            {/* Add Buttons for each direction */}
            <AddButton
                position={Position.Top}
                onClick={() => data.onAddConnectedStage?.(id, 'top')}
                className="-top-8 left-1/2 -translate-x-1/2"
            />
            <AddButton
                position={Position.Right}
                onClick={() => data.onAddConnectedStage?.(id, 'right')}
                className="top-1/2 -right-8 -translate-y-1/2"
            />
            <AddButton
                position={Position.Bottom}
                onClick={() => data.onAddConnectedStage?.(id, 'bottom')}
                className="-bottom-8 left-1/2 -translate-x-1/2"
            />
            <AddButton
                position={Position.Left}
                onClick={() => data.onAddConnectedStage?.(id, 'left')}
                className="top-1/2 -left-8 -translate-y-1/2"
            />

            <div
                className={cn(
                    "px-4 py-3 shadow-lg rounded-lg border-2 min-w-[180px] transition-all duration-200",
                    selected ? "border-primary ring-2 ring-primary/20" : "border-border",
                    "bg-card"
                )}
                style={{
                    backgroundColor: data.color,
                    borderColor: data.color ? 'transparent' : undefined,
                    color: textColor
                }}
                onDoubleClick={() => setIsEditing(true)}
            >
                {/* Handles - Larger size for easier dragging */}
                <Handle id="top-target" type="target" position={Position.Top} className="w-8 h-8 !bg-muted-foreground hover:!bg-primary transition-colors -top-4" />
                <Handle id="top-source" type="source" position={Position.Top} className="w-8 h-8 !bg-muted-foreground hover:!bg-primary transition-colors -top-4" />

                <Handle id="left-target" type="target" position={Position.Left} className="w-8 h-8 !bg-muted-foreground hover:!bg-primary transition-colors -left-4" />
                <Handle id="left-source" type="source" position={Position.Left} className="w-8 h-8 !bg-muted-foreground hover:!bg-primary transition-colors -left-4" />

                <div className="font-semibold text-center break-words select-none min-h-[24px] flex items-center justify-center">
                    {isEditing ? (
                        <Input
                            ref={inputRef}
                            value={labelText}
                            onChange={(e) => setLabelText(e.target.value)}
                            onBlur={handleLabelSubmit}
                            onKeyDown={handleKeyDown}
                            className="h-6 text-xs bg-background/50 border-none text-center p-0 w-full"
                        />
                    ) : (
                        data.label
                    )}
                </div>

                <Handle id="right-target" type="target" position={Position.Right} className="w-8 h-8 !bg-muted-foreground hover:!bg-primary transition-colors -right-4" />
                <Handle id="right-source" type="source" position={Position.Right} className="w-8 h-8 !bg-muted-foreground hover:!bg-primary transition-colors -right-4" />

                <Handle id="bottom-target" type="target" position={Position.Bottom} className="w-8 h-8 !bg-muted-foreground hover:!bg-primary transition-colors -bottom-4" />
                <Handle id="bottom-source" type="source" position={Position.Bottom} className="w-8 h-8 !bg-muted-foreground hover:!bg-primary transition-colors -bottom-4" />
            </div>
        </div>
    );
};

export default memo(FunnelNode);
