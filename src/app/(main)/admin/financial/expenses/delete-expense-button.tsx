"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Trash } from "lucide-react"
import { deleteExpense } from "./actions"
import { toast } from "sonner"
import { useState } from "react"

interface DeleteExpenseButtonProps {
    id: string
}

export function DeleteExpenseButton({ id }: DeleteExpenseButtonProps) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm("Tem certeza que deseja excluir esta despesa?")) return

        setLoading(true)
        try {
            const result = await deleteExpense(id)
            if (result.success) {
                toast.success("Despesa excluída com sucesso")
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("Erro ao excluir despesa")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenuItem
            onSelect={(e) => {
                e.preventDefault()
                handleDelete()
            }}
            disabled={loading}
            className="text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-400/10"
        >
            <Trash className="mr-2 h-4 w-4" />
            Excluir
        </DropdownMenuItem>
    )
}
