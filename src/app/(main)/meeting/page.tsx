import { getMeetingDashboardData } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { ProjectGantt } from "@/components/meeting/project-gantt"

export const dynamic = 'force-dynamic'

export default async function MeetingDashboardPage() {
    const data = await getMeetingDashboardData()

    return (
        <div className="h-screen bg-gray-100 dark:bg-background p-8 flex flex-col overflow-hidden">
            <header className="mb-4 flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">Painel de Reunião Semanal</h1>
                    <p className="text-muted-foreground">Visão geral de entregas e alertas para acompanhamento.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-card px-4 py-2 rounded-lg shadow-sm border dark:border-border flex flex-col items-center">
                        <span className="text-xs text-muted-foreground font-bold uppercase">Atrasados</span>
                        <span className="text-2xl font-bold text-red-600">{data.overdueTasks.length}</span>
                    </div>
                    <div className="bg-white dark:bg-card px-4 py-2 rounded-lg shadow-sm border dark:border-border flex flex-col items-center">
                        <span className="text-xs text-muted-foreground font-bold uppercase">Próx. 7 Dias</span>
                        <span className="text-2xl font-bold text-blue-600">{data.upcomingTasks.length}</span>
                    </div>
                </div>
            </header>

            <div className="w-full min-w-0 overflow-hidden flex-shrink-0 mb-4">
                <ProjectGantt projects={data.ganttProjects} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-y-auto">
                {/* Column 1: Critical Alerts (Red) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-6 w-6" />
                        Atenção Imediata (Atrasados)
                    </h2>
                    {data.overdueTasks.length === 0 ? (
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-6 text-center text-green-700">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                                Nenhuma entrega atrasada! 🎉
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {data.overdueTasks.map(task => (
                                <Card key={task.id} className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-foreground">{task.projectName}</h3>
                                            <Badge variant="destructive">+{task.daysLate} dias</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">{task.clientName}</p>
                                        <div className="text-sm font-medium text-red-600 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {task.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2">
                                            Era para: {format(task.plannedEnd, "dd/MM/yyyy")}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 2: Upcoming (Yellow/Blue) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
                        <Calendar className="h-6 w-6" />
                        Próximas Entregas (7 Dias)
                    </h2>
                    {data.upcomingTasks.length === 0 ? (
                        <Card className="bg-gray-50 dark:bg-card border-dashed dark:border-border">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Nenhuma entrega prevista para esta semana.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {data.upcomingTasks.map(task => (
                                <Card key={task.id} className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-900">{task.projectName}</h3>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                {format(task.plannedEnd, "dd/MM")}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{task.clientName}</p>
                                        <div className="text-sm font-medium text-gray-800 dark:text-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-blue-500" />
                                            {task.title}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 3: Portfolio Health */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="h-6 w-6" />
                        Saúde da Carteira
                    </h2>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {data.projectHealth.map(project => (
                                    <Link href={`/projects/${project.id}`} key={project.id} className="block hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-foreground">{project.name}</div>
                                                <div className="text-xs text-muted-foreground">{project.clientName}</div>
                                            </div>
                                            <div className="text-right">
                                                {project.isLate ? (
                                                    <Badge variant="destructive" className="mb-1">Atrasado</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="mb-1 text-green-600 border-green-200 bg-green-50">No Prazo</Badge>
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    {project.nextDeadline ? format(project.nextDeadline, "dd/MM") : "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {data.projectHealth.length === 0 && (
                                    <div className="p-4 text-center text-muted-foreground">Nenhum projeto ativo.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
