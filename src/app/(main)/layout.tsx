import { Sidebar } from "@/components/sidebar"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-background">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
