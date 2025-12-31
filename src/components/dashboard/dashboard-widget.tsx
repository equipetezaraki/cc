import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface DashboardWidgetProps {
    title: string
    description?: string
    icon?: React.ReactNode
    children: React.ReactNode
    className?: string
    isLoading?: boolean
    error?: string
}

export function DashboardWidget({
    title,
    description,
    icon,
    children,
    className,
    isLoading,
    error
}: DashboardWidgetProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium">{title}</CardTitle>
                    {description && (
                        <CardDescription>{description}</CardDescription>
                    )}
                </div>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center p-6 text-sm text-red-500">
                        {error}
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    )
}
