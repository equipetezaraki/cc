'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
export { Role } from '@prisma/client'
import { Role } from '@prisma/client'

interface RoleContextType {
    role: Role
    setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children, initialRole }: { children: ReactNode, initialRole?: Role }) {
    const [role, setRole] = useState<Role>(initialRole || 'ADMIN')

    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    )
}

export function useRole() {
    const context = useContext(RoleContext)
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider')
    }
    return context
}
