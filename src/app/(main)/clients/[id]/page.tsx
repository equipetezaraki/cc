import { notFound } from 'next/navigation'
import { getClientById } from '../actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const client = await getClientById(id)

    if (!client) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/clients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{client.name}</h1>
                    <p className="text-muted-foreground">
                        Código: {client.code.toString().padStart(3, '0')} • {client.company}
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="rounded-lg border p-6">
                    <h2 className="text-xl font-semibold mb-4">Informações do Cliente</h2>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                            <dd className="text-sm">{client.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Telefone</dt>
                            <dd className="text-sm">{client.phone}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Empresa</dt>
                            <dd className="text-sm">{client.company || '-'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-lg border p-6">
                    <h2 className="text-xl font-semibold mb-4">Projetos</h2>
                    {client.projects.length === 0 ? (
                        <p className="text-muted-foreground">Nenhum projeto cadastrado</p>
                    ) : (
                        <div className="space-y-4">
                            {client.projects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-medium">{project.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {project.stages.length} etapas
                                        </p>
                                    </div>
                                    <Badge>{project.status}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border p-6 bg-muted/50">
                    <h2 className="text-xl font-semibold mb-2">Dashboard do Cliente</h2>
                    <p className="text-muted-foreground">
                        Em breve: Cronograma do projeto, métricas e acompanhamento em tempo real.
                    </p>
                </div>
            </div>
        </div>
    )
}
