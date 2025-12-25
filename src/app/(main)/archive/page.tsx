import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { Archive } from "lucide-react"
import { DeleteProjectButton } from "@/components/delete-project-button"

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
    const archivedProjects = await prisma.project.findMany({
        where: {
            status: 'ARCHIVED'
        },
        include: {
            client: true
        },
        orderBy: [
            { createdAt: 'desc' }
        ]
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 dark:bg-card rounded-lg">
                    <Archive className="h-6 w-6 text-gray-600 dark:text-muted-foreground" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Banco de Projetos Encerrados</h1>
                    <p className="text-muted-foreground">Histórico de projetos finalizados ou arquivados.</p>
                </div>
            </div>

            {archivedProjects.length === 0 ? (
                <Card className="bg-gray-50 dark:bg-card border-dashed dark:border-border">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <Archive className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhum projeto arquivado encontrado.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archivedProjects.map(project => (
                        <div key={project.id} className="relative">
                            <Link href={`/projects/${project.id}`}>
                                <Card className="hover:bg-gray-50 dark:hover:bg-accent transition-colors cursor-pointer border-l-4 border-l-gray-400 dark:border-l-muted">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <Badge variant="outline" className="bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground border-gray-200 dark:border-border">
                                                Arquivado
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg pr-10">{project.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Criado em {format(project.createdAt, "dd/MM/yyyy")}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-1">{project.client.name}</p>
                                        <p className="text-xs text-gray-400 dark:text-muted-foreground">{project.client.company}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            <div className="absolute top-4 right-4 z-10">
                                <DeleteProjectButton
                                    projectId={project.id}
                                    projectName={project.name}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
