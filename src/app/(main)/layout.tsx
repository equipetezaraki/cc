import { Sidebar } from "@/components/sidebar"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-background">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-8 h-full overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
