'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BarChart3, KanbanSquare, LayoutDashboard, PlusCircle, Settings, Archive, Users, LogOut, ClipboardList } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRole } from "@/contexts/role-context"
import { logoutAction } from "@/app/login/actions"

const sidebarItems = [
    {
        title: "Farol (Reunião)",
        href: "/meeting",
        icon: BarChart3,
        variant: "default"
    },
    {
        title: "Kanban de Projetos",
        href: "/kanban",
        icon: KanbanSquare,
        variant: "ghost"
    },
    {
        title: "Minhas Tarefas",
        href: "/deliveries",
        icon: ClipboardList,
        variant: "ghost"
    },
    {
        title: "Novo Projeto",
        href: "/onboarding",
        icon: PlusCircle,
        variant: "ghost",
        roles: ['ADMIN', 'CLOSER']
    },
    {
        title: "Encerrados",
        href: "/archive",
        icon: Archive,
        variant: "ghost"
    }
]

import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"

// ... imports

export function Sidebar() {
    const pathname = usePathname()
    const { role } = useRole()

    return (
        <div className="pb-12 min-h-screen w-64 border-r bg-background hidden md:block fixed left-0 top-0 bottom-0 z-10">
            <div className="flex flex-col h-full">
                <div className="space-y-4 py-4 flex-1">
                    <div className="px-3 py-2">
                        <div className="flex items-center justify-center mb-6 px-4">
                            <div className="relative w-40 h-12">
                                <Image
                                    src="https://pub-0d7f337b40f945f39835d82c45c31e19.r2.dev/Nome%20-%20Transparente.webp"
                                    alt="Tezaraki OS"
                                    fill
                                    className="object-contain dark:hidden"
                                    priority
                                />
                                <Image
                                    src="https://pub-0d7f337b40f945f39835d82c45c31e19.r2.dev/872bc191-448c-4ffc-b8f8-411139139116.webp"
                                    alt="Tezaraki OS"
                                    fill
                                    className="object-contain hidden dark:block"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            {sidebarItems.map((item) => {
                                if (item.roles && !item.roles.includes(role)) {
                                    return null
                                }
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={pathname === item.href || pathname.startsWith(item.href) && item.href !== '/' ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start",
                                                (pathname === item.href || pathname.startsWith(item.href) && item.href !== '/') && "bg-accent font-medium"
                                            )}
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Button>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                            Configurações
                        </h2>
                        <div className="space-y-1">
                            <div className="px-4 mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium">Tema</span>
                                <ModeToggle />
                            </div>
                            {role === 'ADMIN' && (
                                <Link href="/members">
                                    <Button
                                        variant={pathname === '/members' ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start",
                                            pathname === '/members' && "bg-accent font-medium"
                                        )}
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        Membros
                                    </Button>
                                </Link>
                            )}
                            <Button variant="ghost" className="w-full justify-start">
                                <Settings className="mr-2 h-4 w-4" />
                                Geral
                            </Button>
                            <form action={async () => {
                                await logoutAction()
                            }}>
                                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
