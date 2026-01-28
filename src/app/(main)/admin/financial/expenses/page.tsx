import { getExpenses } from "./actions"
import { Button } from "@/components/ui/button"
import { Plus, Receipt, Calendar as CalendarIcon } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ExpenseForm } from "./expense-form"
import { ExpenseRow } from "./expense-row"

export default async function ExpensesPage() {
    const expenses = await getExpenses()

    const totalRecurring = (expenses as any[])
        .filter(e => e.type === 'RECURRING')
        .reduce((acc: number, curr: any) => acc + curr.amount, 0)

    const totalOneTime = (expenses as any[])
        .filter(e => e.type === 'ONE_TIME')
        .reduce((acc: number, curr: any) => acc + curr.amount, 0)

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Despesas</h1>
                    <p className="text-muted-foreground">
                        Controle assinaturas mensais e pagamentos pontuais.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Despesa
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Adicionar Despesa</DialogTitle>
                            <DialogDescription>
                                Preencha os detalhes da nova despesa abaixo.
                            </DialogDescription>
                        </DialogHeader>
                        <ExpenseForm />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <Receipt className="h-4 w-4" />
                        <span className="text-sm font-medium">Total Mensal (Recorrente)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRecurring)}
                    </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Total Pontual</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOneTime)}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead className="text-muted-foreground">Descrição</TableHead>
                            <TableHead className="text-muted-foreground">Tipo</TableHead>
                            <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                            <TableHead className="text-muted-foreground">Data</TableHead>
                            <TableHead className="text-muted-foreground">Categoria</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    Nenhuma despesa cadastrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => (
                                <ExpenseRow key={expense.id} expense={expense as any} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
