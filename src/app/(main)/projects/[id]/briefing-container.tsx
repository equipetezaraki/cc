'use client'

import { useState } from "react"
import { BriefingView } from "./briefing-view"
import { BriefingForm } from "./briefing/briefing-form"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

interface BriefingContainerProps {
    projectId: string
    initialData: any
    canEdit: boolean
}

export function BriefingContainer({ projectId, initialData, canEdit }: BriefingContainerProps) {
    const [isEditing, setIsEditing] = useState(false)
    // If there is no initial data, start in edit mode if allowed
    const [hasData, setHasData] = useState(!!initialData)

    // If no data and can edit, show form immediately? 
    // Maybe better to show empty view with "Create" button.
    // Let's stick to explicit action.

    if (isEditing) {
        return (
            <BriefingForm
                project={{ id: projectId, ...initialData }}
                onCancel={() => setIsEditing(false)}
                onSuccess={() => {
                    setIsEditing(false)
                    setHasData(true)
                }}
            />
        )
    }

    return (
        <div className="space-y-4">
            {canEdit && (
                <div className="flex justify-end">
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        {hasData ? "Editar Briefing" : "Preencher Briefing"}
                    </Button>
                </div>
            )}
            <BriefingView data={initialData} />
        </div>
    )
}
