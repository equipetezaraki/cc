'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Role = 'ADMIN' | 'CLOSER' | 'CRM' | 'IA'

interface RoleContextType {
    role: Role
    setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children, initialRole }: { children: ReactNode, initialRole?: Role }) {
    const [role, setRole] = useState<Role>(initialRole || 'ADMIN')

    // We can still keep setRole for testing if needed, but primarily it should come from the session.
    // For now, let's allow manual override only if we want to keep the simulator, 
    // but the user asked for real auth. Let's stick to the session role as the source of truth.
    // However, for the "Carteira" feature later, we might want to "view as" other roles?
    // Let's keep the state but initialize it from the server.

    useEffect(() => {
        if (initialRole) {
            setRole(initialRole)
        }
    }, [initialRole])

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
