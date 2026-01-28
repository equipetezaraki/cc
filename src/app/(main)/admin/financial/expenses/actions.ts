'use server'

import { prisma } from "@/lib/prisma"
import { ExpenseType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getExpenses() {
    try {
        const expenses = await prisma.expense.findMany({
            where: { isActive: true },
            orderBy: { date: 'desc' }
        })
        return expenses
    } catch (error) {
        console.error("Error fetching expenses:", error)
        return []
    }
}

export async function createExpense(data: {
    description: string
    amount: number
    type: ExpenseType
    category?: string
    date: Date
}) {
    try {
        const expense = await prisma.expense.create({
            data: {
                ...data,
                isActive: true
            }
        })
        revalidatePath("/admin/financial/expenses")
        return { success: true, expense }
    } catch (error) {
        console.error("Error creating expense:", error)
        return { success: false, error: "Falha ao criar despesa" }
    }
}

export async function updateExpense(id: string, data: {
    description?: string
    amount?: number
    type?: ExpenseType
    category?: string
    date?: Date
}) {
    try {
        const expense = await prisma.expense.update({
            where: { id },
            data
        })
        revalidatePath("/admin/financial/expenses")
        return { success: true, expense }
    } catch (error) {
        console.error("Error updating expense:", error)
        return { success: false, error: "Falha ao atualizar despesa" }
    }
}

export async function deleteExpense(id: string) {
    try {
        await prisma.expense.update({
            where: { id },
            data: { isActive: false }
        })
        revalidatePath("/admin/financial/expenses")
        return { success: true }
    } catch (error) {
        console.error("Error deleting expense:", error)
        return { success: false, error: "Falha ao deletar despesa" }
    }
}
