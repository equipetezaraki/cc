'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { deleteClient } from './delete-client-action'

type Client = {
    id: string
    name: string
}

export function DeleteClientButton({ client }: { client: Client }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const router = useRouter()

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteClient(client.id)

            if (result.success) {
                toast.success('Cliente excluído com sucesso!')
                setOpen(false)
                router.push('/clients')
                router.refresh()
            } else {
                toast.error(result.error || 'Erro ao excluir cliente')
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que quer EXCLUIR?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá excluir permanentemente o cliente{' '}
                        <strong>{client.name}</strong> e todos os seus projetos, tarefas e dados associados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sim, excluir permanentemente
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
