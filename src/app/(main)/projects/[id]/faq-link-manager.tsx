'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Save, Edit2, X } from "lucide-react"
import { saveFaqLink } from "./actions"
import { toast } from "sonner"

interface FaqLinkManagerProps {
    projectId: string
    currentFaqLink: string | null
    canEdit: boolean
}

export function FaqLinkManager({ projectId, currentFaqLink, canEdit }: FaqLinkManagerProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [faqLink, setFaqLink] = useState(currentFaqLink || "")
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        if (!faqLink.trim()) {
            toast.error("Por favor, insira um link válido")
            return
        }

        startTransition(async () => {
            const result = await saveFaqLink(projectId, faqLink)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Link do FAQ salvo com sucesso!")
                setIsEditing(false)
            }
        })
    }

    const handleCancel = () => {
        setFaqLink(currentFaqLink || "")
        setIsEditing(false)
    }

    if (!canEdit && !currentFaqLink) {
        return null
    }

    return (
        <div className="space-y-2">
            {isEditing ? (
                <div className="space-y-2">
                    <Label htmlFor="faqLink" className="text-sm font-medium">
                        Link do FAQ
                    </Label>
                    <Input
                        id="faqLink"
                        type="url"
                        placeholder="https://..."
                        value={faqLink}
                        onChange={(e) => setFaqLink(e.target.value)}
                        disabled={isPending}
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isPending}
                        >
                            <Save className="h-3 w-3 mr-1" />
                            Salvar
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isPending}
                        >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    {currentFaqLink ? (
                        <a
                            href={currentFaqLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <ExternalLink className="h-3 w-3" /> FAQ
                        </a>
                    ) : (
                        <span className="text-sm text-muted-foreground">FAQ não anexado</span>
                    )}
                    {canEdit && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
