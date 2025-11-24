'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteUser } from "./actions"
import { useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { EditMemberDialog } from "./edit-member-dialog"

export function MembersTable({ users }: { users: any[] }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = (id: string) => {
        if (!confirm("Tem certeza que deseja remover este membro?")) return
        startTransition(async () => {
            await deleteUser(id)
        })
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <EditMemberDialog user={user} />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(user.id)}
                                    disabled={isPending || user.role === 'ADMIN'}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
