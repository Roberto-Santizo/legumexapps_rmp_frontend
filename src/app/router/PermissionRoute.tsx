import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"

import { requiredRoutePermission } from "./routePermissions"

export function PermissionRoute({ path, children }: { path: string; children: ReactNode }) {
    const { user } = useAuthentication()
    const permission = requiredRoutePermission(path)
    return permission && !user?.permissions.includes(permission) ? <Navigate to="/403" replace /> : <>{children}</>
}

export function AuthorizedHome() {
    const { user } = useAuthentication()
    const permissions = user?.permissions ?? []
    const to = permissions.includes("dashboard:view") ? "/dashboard" : permissions.includes("rawMaterialReceptions:view") ? "/boletas" : "/ayuda"
    return <Navigate to={to} replace />
}
