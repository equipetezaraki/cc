'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EditClientDialog } from './edit-client-dialog'
import { DeleteClientButton } from './delete-client-button'
import { useRole } from '@/contexts/role-context'

type Client = {
    id: string
    code: number
    name: string
    email: string
    company: string | null
    phone: string
    projects: {
        id: string
        name: string
        status: string
    }[]
}

export function ClientList({ clients }: { clients: Client[] }) {
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const router = useRouter()
    const { role } = useRole()
    const isAdmin = role === 'ADMIN'

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Código</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Projetos</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    Nenhum cliente cadastrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-mono">
                                        {client.code.toString().padStart(3, '0')}
                                    </TableCell>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.company || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {client.projects.map((project) => (
                                                <Badge key={project.id} variant="secondary">
                                                    {project.name}
                                                </Badge>
                                            ))}
                                            {client.projects.length === 0 && (
                                                <span className="text-muted-foreground text-sm">
                                                    Nenhum projeto
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/clients/${client.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {isAdmin && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingClient(client)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteClientButton client={client} />
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {editingClient && (
                <EditClientDialog
                    client={editingClient}
                    open={!!editingClient}
                    onOpenChange={(open) => !open && setEditingClient(null)}
                />
            )}
        </>
    )
}
