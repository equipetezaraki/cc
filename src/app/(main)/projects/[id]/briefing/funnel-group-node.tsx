import { memo, useState, useRef, useEffect } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import { Input } from "@/components/ui/input";

const FunnelGroupNode = ({ id, data }: NodeProps) => {
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

    return (
        <div className="w-full h-full border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/5 p-4">
            <div
                className="text-sm font-semibold text-muted-foreground mb-2 cursor-text select-none"
                onDoubleClick={() => setIsEditing(true)}
            >
                {isEditing ? (
                    <Input
                        ref={inputRef}
                        value={labelText}
                        onChange={(e) => setLabelText(e.target.value)}
                        onBlur={handleLabelSubmit}
                        onKeyDown={handleKeyDown}
                        className="h-6 text-xs bg-background/50 border-none p-0 w-full"
                    />
                ) : (
                    data.label
                )}
            </div>
        </div>
    );
};

export default memo(FunnelGroupNode);
