import { getFinancialClients } from "./actions"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight, LayoutDashboard, History, Receipt } from "lucide-react"

export default async function FinancialPage() {
    const clients = await getFinancialClients()

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                    <p className="text-muted-foreground">
                        Gerencie contratos e valores dos clientes ativos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/financial/expenses">
                        <Button variant="outline" className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
                            <Receipt className="h-4 w-4 mr-2" />
                            Gestão de Despesas
                        </Button>
                    </Link>
                    <Link href="/admin/financial/history">
                        <Button variant="outline">
                            <History className="h-4 w-4 mr-2" />
                            Histórico de Contratos
                        </Button>
                    </Link>
                    <Link href="/admin/financial/dashboard">
                        <Button variant="default">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Visão Executiva (Forecast)
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(clients as any).map((client: any) => {
                    const activeProjects = client.projects.filter((p: any) => p.status !== 'ARCHIVED').length
                    const totalProjects = client.projects.length

                    const now = new Date()
                    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

                    const hasActiveContract = client.projects.some((p: any) => {
                        const projectContracts = p.contracts || []
                        return projectContracts.some((c: any) => {
                            if (!c.isActive) return false
                            if (!c.paymentStartDate || !c.durationMonths) return false

                            const startDate = new Date(c.paymentStartDate)
                            if (isNaN(startDate.getTime())) return false

                            // Calculate the date of the last installment
                            const lastInstallmentDate = new Date(
                                startDate.getFullYear(),
                                startDate.getMonth() + (c.durationMonths - 1),
                                1
                            )

                            return lastInstallmentDate >= startOfCurrentMonth
                        })
                    })

                    return (
                        <Link key={client.id} href={`/admin/financial/${client.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xl font-medium">
                                        {client.name}
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground mb-4">
                                        {client.company || client.email}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{activeProjects} Projetos Ativos</span>
                                            <span className="text-xs text-muted-foreground">Total: {totalProjects}</span>
                                        </div>
                                        {hasActiveContract ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                Contrato Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                Pendente
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}

                {clients.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        Nenhum cliente com projetos encontrado.
                    </div>
                )}
            </div>
        </div>
    )
}
