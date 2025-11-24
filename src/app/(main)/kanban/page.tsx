import { getProjects } from "./actions"
import { KanbanBoard } from "./kanban-board"

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
    const projects = await getProjects()

    return (
        <div className="h-screen flex flex-col">
            <header className="border-b p-4 bg-background">
                <h1 className="text-xl font-bold">Quadro de Projetos</h1>
            </header>
            <main className="flex-1 overflow-hidden p-4 bg-background/50">
                <KanbanBoard initialProjects={projects} />
            </main>
        </div>
    )
}
