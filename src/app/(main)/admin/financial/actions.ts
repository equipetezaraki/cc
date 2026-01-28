'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getFinancialClients() {
    const clients = await prisma.client.findMany({
        where: {
            projects: {
                some: {
                    status: "ACTIVE"
                }
            }
        },
        include: {
            projects: {
                where: {
                    status: "ACTIVE"
                },
                include: {
                    contracts: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    })
    return clients
}

export async function getFinancialHistory() {
    const clients = await prisma.client.findMany({
        where: {
            projects: {
                some: {} // Any status
            }
        },
        include: {
            projects: {
                include: {
                    contracts: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    })
    return clients
}

export async function getClientFinancials(clientId: string) {
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
            projects: {
                include: {
                    contracts: {
                        include: {
                            installments: {
                                orderBy: {
                                    monthIndex: 'asc'
                                }
                            }
                        },
                        orderBy: {
                            signatureDate: 'desc'
                        }
                    }
                }
            }
        }
    })
    return client
}

export type ContractData = {
    contractId?: string // If provided, updates existing contract
    signatureDate: Date
    paymentStartDate: Date
    durationMonths: number
    installments: {
        monthIndex: number
        implementationValue: number
        monthlyFeeValue: number
    }[]
}

export async function upsertProjectContract(projectId: string, data: ContractData) {
    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
        // 1. Upsert/Create the contract
        const contract = await tx.projectContract.upsert({
            where: { id: data.contractId || 'new-dummy-id' },
            create: {
                projectId,
                signatureDate: data.signatureDate,
                paymentStartDate: data.paymentStartDate,
                durationMonths: data.durationMonths,
                isActive: true
            },
            update: {
                signatureDate: data.signatureDate,
                paymentStartDate: data.paymentStartDate,
                durationMonths: data.durationMonths,
                isActive: true
            }
        })

        // 2. Handle installments
        await tx.contractInstallment.deleteMany({
            where: { contractId: contract.id }
        })

        if (data.installments.length > 0) {
            await tx.contractInstallment.createMany({
                data: data.installments.map(inst => ({
                    contractId: contract.id,
                    monthIndex: inst.monthIndex,
                    implementationValue: inst.implementationValue,
                    monthlyFeeValue: inst.monthlyFeeValue
                }))
            })
        }
    }, {
        maxWait: 5000,
        timeout: 15000,
    })

    revalidatePath('/admin/financial')
    revalidatePath(`/admin/financial/${projectId}`)
}

export async function deleteProjectContract(contractId: string, projectId: string) {
    await prisma.projectContract.delete({
        where: { id: contractId }
    })

    revalidatePath('/admin/financial')
    revalidatePath(`/admin/financial/${projectId}`)
}

export type FinancialItem = {
    month: string // "MM/YYYY"
    date: Date
    implementation: number
    monthly: number
    projectName: string
    projectStatus: string
    clientName: string
}

export type ExpenseItem = {
    id: string
    description: string
    amount: number
    type: 'RECURRING' | 'ONE_TIME'
    date: Date
    month: string
}

export async function getFinancialForecast() {
    // Fetch all contracts with their installments
    const contracts = await prisma.projectContract.findMany({
        include: {
            installments: true,
            project: {
                select: {
                    name: true,
                    status: true,
                    client: {
                        select: { name: true }
                    }
                }
            }
        }
    })

    // Fetch all active expenses
    const expenses = await prisma.expense.findMany({
        where: { isActive: true }
    })

    const allItems: FinancialItem[] = []

    contracts.forEach(contract => {
        const startDate = new Date(contract.paymentStartDate)

        contract.installments.forEach(inst => {
            const instDate = new Date(startDate)
            instDate.setMonth(startDate.getMonth() + (inst.monthIndex - 1))

            allItems.push({
                month: `${String(instDate.getMonth() + 1).padStart(2, '0')}/${instDate.getFullYear()}`,
                date: instDate,
                implementation: inst.implementationValue,
                monthly: inst.monthlyFeeValue,
                projectName: contract.project.name,
                projectStatus: contract.project.status,
                clientName: contract.project.client.name
            })
        })
    })

    const expenseItems: ExpenseItem[] = expenses.map(expense => {
        const date = new Date(expense.date)
        return {
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            type: expense.type,
            date: date,
            month: `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
        }
    })

    // Sort items by date
    allItems.sort((a, b) => a.date.getTime() - b.date.getTime())

    return {
        items: allItems,
        expenses: expenseItems
    }
}
