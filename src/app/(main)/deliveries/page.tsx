import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DeliveriesList } from "./deliveries-list"

export default async function DeliveriesPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const userRole = session.user.role

    // Fetch tasks based on role
    // If ADMIN, fetch ALL tasks (except from archived projects)
    // If not ADMIN, fetch only tasks assigned to that role (except from archived projects)
    const tasks = await prisma.task.findMany({
        where: {
            ...(userRole === 'ADMIN' ? {} : {
                assignedRole: userRole
            }),
            project: {
                status: {
                    not: 'ARCHIVED'
                }
            }
        },
        include: {
            project: {
                select: {
                    name: true,
                    stages: {
                        select: {
                            stageNumber: true,
                            funnelNumber: true,
                            endDate: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { plannedEnd: 'asc' },
            { project: { name: 'asc' } }
        ]
    })

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Minhas Entregas</h1>
                    <p className="text-muted-foreground">
                        {userRole === 'ADMIN'
                            ? "Visão geral de todas as tarefas da equipe."
                            : "Gerencie suas tarefas e entregas pendentes."}
                    </p>
                </div>
            </div>

            <DeliveriesList tasks={tasks} userRole={userRole} />
        </div>
    )
}
