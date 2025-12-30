import { getFinancialHistory } from "../actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { HistoryContainer } from "@/components/financial/history-container"

export default async function FinancialHistoryPage() {
    const clients = await getFinancialHistory()

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/financial">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Histórico de Contratos</h1>
                    <p className="text-muted-foreground">
                        Visualize todos os contratos, incluindo projetos ativos e encerrados.
                    </p>
                </div>
            </div>

            <HistoryContainer initialData={clients} />
        </div>
    )
}
