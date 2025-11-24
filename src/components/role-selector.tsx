'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRole, Role } from "@/contexts/role-context"
import { UserCircle } from "lucide-react"

export function RoleSelector() {
    const { role, setRole } = useRole()

    return (
        <div className="px-3 py-2 mt-auto border-t">
            <div className="flex items-center gap-2 px-4 mb-2 text-sm text-muted-foreground">
                <UserCircle className="h-4 w-4" />
                <span>Simular Cargo:</span>
            </div>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="CLOSER">Closer</SelectItem>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="IA">IA</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
