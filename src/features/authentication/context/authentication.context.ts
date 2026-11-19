import { createContext } from "react"
import type { AuthSession, AuthenticatedUser } from "@/shared/session/sessionStorage"

export type AuthenticationContextValue = {
    user: AuthenticatedUser | null
    isAuthenticated: boolean
    login: (session: AuthSession) => void
    logout: () => void
}

export const AuthenticationContext = createContext<AuthenticationContextValue | undefined>(undefined)
