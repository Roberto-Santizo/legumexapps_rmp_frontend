import { Navigate, Outlet } from "react-router-dom"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"

export function ProtectedRoute() {
    const { isAuthenticated } = useAuthentication()

    if (!isAuthenticated) return <Navigate to="/login" replace />

    return <Outlet />
}
