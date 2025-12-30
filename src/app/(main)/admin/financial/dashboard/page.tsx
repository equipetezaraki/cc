import { getFinancialForecast } from "../actions"
import { DashboardContainer } from "@/components/financial/dashboard-container"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutDashboard, List } from "lucide-react"
import Link from "next/link"

export default async function FinancialDashboardPage() {
    const { items } = await getFinancialForecast()

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/financial">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                        <p className="text-muted-foreground">Projeções de faturamento e saúde financeira</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
                    <Link href="/admin/financial">
                        <Button variant="ghost" size="sm" className="text-xs">
                            <List className="h-3.5 w-3.5 mr-2" />
                            Lista de Clientes
                        </Button>
                    </Link>
                    <Button variant="secondary" size="sm" className="text-xs shadow-sm" disabled>
                        <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
                        Visão Executiva
                    </Button>
                </div>
            </div>

            <DashboardContainer initialData={{ items }} />
        </div>
    )
}
