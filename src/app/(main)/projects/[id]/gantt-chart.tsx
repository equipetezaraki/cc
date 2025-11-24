'use client'

import { Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./gantt-dark.css";
import { Gantt } from "gantt-task-react";
import { Task as PrismaTask } from "@prisma/client";

interface GanttChartProps {
    tasks: PrismaTask[]
}

export function GanttChart({ tasks }: GanttChartProps) {
    // Transform Prisma tasks to Gantt tasks
    const ganttTasks: Task[] = tasks.map(t => ({
        start: new Date(t.plannedStart),
        end: new Date(t.plannedEnd),
        name: t.title,
        id: t.id,
        type: 'task',
        progress: t.isCompleted ? 100 : 0,
        isDisabled: true, // Read-only for now
        styles: {
            progressColor: t.isCompleted ? '#22c55e' : '#3b82f6',
            progressSelectedColor: t.isCompleted ? '#16a34a' : '#2563eb',
        },
    }))

    if (ganttTasks.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Nenhuma tarefa encontrada.</div>
    }

    return (
        <div className="w-full overflow-x-auto border dark:border-border rounded-lg bg-white dark:bg-card">
            <Gantt
                tasks={ganttTasks}
                viewMode={ViewMode.Day}
                locale="pt-BR"
                listCellWidth="155px"
                columnWidth={60}
                barFill={50}
            />
        </div>
    )
}
