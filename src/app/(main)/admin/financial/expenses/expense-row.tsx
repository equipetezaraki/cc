"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import { ExpenseForm } from "./expense-form"
import { DeleteExpenseButton } from "./delete-expense-button"
interface ExpenseRowProps {
    expense: {
        id: string
        description: string
        amount: number
        type: 'RECURRING' | 'ONE_TIME'
        category: string | null
        date: Date
    }
}

export function ExpenseRow({ expense }: ExpenseRowProps) {
    return (
        <TableRow className="border-white/5 hover:bg-white/5">
            <TableCell className="font-medium text-white">{expense.description}</TableCell>
            <TableCell>
                <Badge
                    variant={expense.type === 'RECURRING' ? 'default' : 'secondary'}
                    className={expense.type === 'RECURRING'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }
                >
                    {expense.type === 'RECURRING' ? 'Recorrente' : 'Pontual'}
                </Badge>
            </TableCell>
            <TableCell className="text-right text-white font-mono">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}
            </TableCell>
            <TableCell className="text-muted-foreground">
                {format(new Date(expense.date), "dd/MM/yyyy", { locale: ptBR })}
            </TableCell>
            <TableCell className="text-muted-foreground">{expense.category || '-'}</TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                        <Dialog>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-muted-foreground hover:text-white cursor-pointer focus:bg-white/5">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-900 border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle>Editar Despesa</DialogTitle>
                                    <DialogDescription>
                                        Altere os dados da despesa selecionada.
                                    </DialogDescription>
                                </DialogHeader>
                                <ExpenseForm expense={expense} />
                            </DialogContent>
                        </Dialog>
                        <DeleteExpenseButton id={expense.id} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}
