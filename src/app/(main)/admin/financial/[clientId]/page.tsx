import { getClientFinancials } from "@/app/(main)/admin/financial/actions"
import { ContractForm } from "@/components/financial/contract-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Calendar, FileText, CheckCircle2, Plus } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DeleteContractButton } from "@/components/financial/delete-contract-button"

export default async function ClientFinancialPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params
    const client = await getClientFinancials(clientId)

    if (!client) {
        notFound()
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/financial">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                    <p className="text-muted-foreground">Projects e Contratos</p>
                </div>
            </div>

            <div className="grid gap-6">
                {client.projects.map((project) => {
                    const projectContracts = project.contracts
                    const hasContracts = projectContracts.length > 0

                    return (
                        <Card key={project.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">
                                            {project.name}
                                        </CardTitle>
                                        <CardDescription>Status: {project.status}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="default" size="sm">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Novo Contrato
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Novo Contrato - {project.name}</DialogTitle>
                                                    <DialogDescription>
                                                        Adicione um novo termo ou aditivo de contrato para este projeto.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ContractForm
                                                    projectId={project.id}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {!hasContracts ? (
                                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-md">
                                        Nenhum contrato cadastrado para este projeto.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {projectContracts.map((contract) => {
                                            const cImpl = contract.installments.reduce((acc, curr) => acc + curr.implementationValue, 0)
                                            const cMonthly = contract.installments.reduce((acc, curr) => acc + curr.monthlyFeeValue, 0)

                                            return (
                                                <div key={contract.id} className="group relative border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card">
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                        <div className="space-y-1">
                                                            <div className="text-xs text-muted-foreground uppercase font-semibold">Assinatura</div>
                                                            <div className="flex items-center gap-2 font-medium">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                {new Date(contract.signatureDate).toLocaleDateString('pt-BR')}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs text-muted-foreground uppercase font-semibold">Início Pgto</div>
                                                            <div className="font-medium">
                                                                {new Date(contract.paymentStartDate).toLocaleDateString('pt-BR')}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs text-muted-foreground uppercase font-semibold">Duração</div>
                                                            <div className="font-medium">{contract.durationMonths} meses</div>
                                                        </div>
                                                        <div className="space-y-1 md:col-span-2">
                                                            <div className="text-xs text-muted-foreground uppercase font-semibold">Valores Totais</div>
                                                            <div className="flex gap-4">
                                                                <div className="text-green-600 dark:text-green-400 font-medium">
                                                                    Impl: R$ {cImpl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </div>
                                                                <div className="text-blue-600 dark:text-blue-400 font-medium">
                                                                    Mensal: R$ {cMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t opacity-80 group-hover:opacity-100 transition-opacity">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    Editar
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Editar Contrato</DialogTitle>
                                                                </DialogHeader>
                                                                <ContractForm
                                                                    projectId={project.id}
                                                                    contractId={contract.id}
                                                                    initialData={contract}
                                                                />
                                                            </DialogContent>
                                                        </Dialog>
                                                        <DeleteContractButton
                                                            contractId={contract.id}
                                                            projectId={project.id}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
