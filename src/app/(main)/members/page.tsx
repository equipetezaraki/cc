import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MembersTable } from "./members-table"
import { AddMemberDialog } from "./add-member-dialog"

export default async function MembersPage() {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/')
    }

    const users = await prisma.user.findMany({
        where: {
            role: {
                not: 'CLIENT' // Exclude clients from members list
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Gerenciar Membros</h1>
                <AddMemberDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Equipe Tezaraki</CardTitle>
                </CardHeader>
                <CardContent>
                    <MembersTable users={users} />
                </CardContent>
            </Card>
        </div>
    )
}
