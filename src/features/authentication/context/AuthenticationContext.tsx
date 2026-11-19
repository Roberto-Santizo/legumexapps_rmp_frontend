import { useEffect, useMemo, useState } from "react"
import { refreshSessionApi } from "../api/authentication.api"
import type { ReactNode } from "react"
import { getStoredSession, storeSession, clearStoredSession } from "@/shared/session/sessionStorage"
import type { AuthenticatedUser } from "@/shared/session/sessionStorage"
import { AuthenticationContext } from "./authentication.context"
import type { AuthenticationContextValue } from "./authentication.context"
import { useQueryClient } from "@tanstack/react-query"

export function AuthenticationProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredSession()?.user ?? null)

    useEffect(() => {
        const session = getStoredSession()
        if (!session) return
        let disposed = false
        refreshSessionApi().then(updated => {
            // Do not restore a session that was closed or replaced while loading.
            if (disposed || getStoredSession()?.token !== session.token) return
            storeSession(updated)
            setUser(updated.user)
        }).catch(() => {
            // Network failures keep the current session; API handles expired tokens.
        })
        return () => { disposed = true }
    }, [])

    const value = useMemo<AuthenticationContextValue>(
        () => ({
            user,
            isAuthenticated: !!user,
            login: (session) => {
                void queryClient.cancelQueries()
                queryClient.clear()
                storeSession(session)
                setUser(session.user)
            },
            logout: () => {
                void queryClient.cancelQueries()
                queryClient.clear()
                clearStoredSession()
                setUser(null)
            },
        }),
        [user, queryClient]
    )

    return <AuthenticationContext.Provider value={value}>{children}</AuthenticationContext.Provider>
}

