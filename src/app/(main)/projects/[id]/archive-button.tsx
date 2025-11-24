'use client'

import { Button } from "@/components/ui/button"
import { Archive } from "lucide-react"
import { useTransition } from "react"
import { archiveProject } from "./checklist-actions"

export function ArchiveButton({ projectId }: { projectId: string }) {
    const [isPending, startTransition] = useTransition()

    function handleArchive() {
        if (!confirm("Tem certeza que deseja encerrar este projeto? Ele será movido para o banco de projetos encerrados.")) return

        startTransition(async () => {
            await archiveProject(projectId)
        })
    }

    return (
        <Button variant="outline" size="sm" onClick={handleArchive} disabled={isPending} className="gap-2 text-muted-foreground hover:text-destructive">
            <Archive className="h-4 w-4" />
            {isPending ? "Encerrando..." : "Encerrar Projeto"}
        </Button>
    )
}
