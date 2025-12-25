'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteProject } from '@/app/(main)/archive/actions'
import { toast } from 'sonner'

interface DeleteProjectButtonProps {
    projectId: string
    projectName: string
}

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)

        const result = await deleteProject(projectId)

        if (result.success) {
            toast.success('Projeto excluído', {
                description: `O projeto "${projectName}" foi excluído permanentemente.`,
            })
        } else {
            toast.error('Erro ao excluir', {
                description: result.error || 'Não foi possível excluir o projeto.',
            })
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que quer excluir o projeto?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Este processo será <strong>irreversível</strong>. O projeto &quot;{projectName}&quot; e todos os seus dados (etapas, tarefas, briefing) serão excluídos permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
