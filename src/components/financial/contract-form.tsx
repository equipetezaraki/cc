'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { upsertProjectContract, type ContractData } from "@/app/(main)/admin/financial/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"

interface ContractInstallment {
    monthIndex: number
    implementationValue: number
    monthlyFeeValue: number
}

interface ContractFormProps {
    projectId: string
    contractId?: string // If provided, we are editing this specific contract
    initialData?: {
        signatureDate: Date
        paymentStartDate: Date
        durationMonths: number
        installments: ContractInstallment[]
    } | null
}

export function ContractForm({ projectId, contractId, initialData }: ContractFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [signatureDate, setSignatureDate] = useState<Date | undefined>(
        initialData?.signatureDate ? new Date(initialData.signatureDate) : undefined
    )
    const [paymentStartDate, setPaymentStartDate] = useState<Date | undefined>(
        initialData?.paymentStartDate ? new Date(initialData.paymentStartDate) : undefined
    )
    const [duration, setDuration] = useState<number>(initialData?.durationMonths || 12)
    const [installments, setInstallments] = useState<ContractInstallment[]>(
        initialData?.installments || []
    )

    // Sync installments with duration
    useEffect(() => {
        setInstallments(prev => {
            const newInstallments = [...prev]

            // If growing
            if (duration > prev.length) {
                for (let i = prev.length + 1; i <= duration; i++) {
                    newInstallments.push({
                        monthIndex: i,
                        implementationValue: 0,
                        monthlyFeeValue: 0
                    })
                }
            }
            // If shrinking
            else if (duration < prev.length) {
                return newInstallments.slice(0, duration)
            }

            return newInstallments
        })
    }, [duration])

    const handleInstallmentChange = (index: number, field: 'implementationValue' | 'monthlyFeeValue', value: string) => {
        const floatValue = parseFloat(value) || 0
        setInstallments(prev => {
            const newArr = [...prev]
            newArr[index] = { ...newArr[index], [field]: floatValue }
            return newArr
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!signatureDate) {
            toast.error("Erro", { description: "Data de assinatura é obrigatória" })
            return
        }
        if (!paymentStartDate) {
            toast.error("Erro", { description: "Data de início de pagamento é obrigatória" })
            return
        }

        setIsLoading(true)
        try {
            const data: ContractData = {
                contractId,
                signatureDate: signatureDate!,
                paymentStartDate: paymentStartDate!,
                durationMonths: duration,
                installments: installments
            }

            await upsertProjectContract(projectId, data)
            toast.success("Sucesso", { description: "Contrato salvo com sucesso" })
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Erro", { description: "Falha ao salvar contrato" })
        } finally {
            setIsLoading(false)
        }
    }

    const totalImplementation = installments.reduce((acc, curr) => acc + curr.implementationValue, 0)
    const totalMonthly = installments.reduce((acc, curr) => acc + curr.monthlyFeeValue, 0)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Data de Assinatura</Label>
                    <DatePicker
                        date={signatureDate}
                        setDate={setSignatureDate}
                        placeholder="dd/mm/aaaa"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Início dos Pagamentos</Label>
                    <DatePicker
                        date={paymentStartDate}
                        setDate={setPaymentStartDate}
                        placeholder="dd/mm/aaaa"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Duração (Meses)</Label>
                    <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="60"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                        required
                    />
                </div>
            </div>

            <div className="border rounded-md p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Parcelas / Distribuição</h3>
                    <div className="text-xs text-muted-foreground text-right">
                        <div>Total Impl.: R$ {totalImplementation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div>Total Mensal: R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                    {installments.map((inst, idx) => (
                        <div key={inst.monthIndex} className="grid grid-cols-12 gap-2 items-center text-sm">
                            <div className="col-span-1 font-medium text-center bg-muted rounded py-2">
                                {inst.monthIndex}º
                            </div>
                            <div className="col-span-5 md:col-span-5">
                                <div className="relative">
                                    <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">R$</span>
                                    <Input
                                        type="number"
                                        placeholder="Impl."
                                        className="pl-8 h-9"
                                        step="0.01"
                                        value={inst.implementationValue || ''}
                                        onChange={(e) => handleInstallmentChange(idx, 'implementationValue', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-span-5 md:col-span-5">
                                <div className="relative">
                                    <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">R$</span>
                                    <Input
                                        type="number"
                                        placeholder="Mensal"
                                        className="pl-8 h-9"
                                        step="0.01"
                                        value={inst.monthlyFeeValue || ''}
                                        onChange={(e) => handleInstallmentChange(idx, 'monthlyFeeValue', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Contrato
                </Button>
            </div>
        </form>
    )
}
