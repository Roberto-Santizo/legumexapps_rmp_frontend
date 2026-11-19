import { z } from "zod"
import { plantSchema } from "@/features/plants/schema/plant.schema"
import type { Plant } from "@/features/plants/schema/plant.schema"

const STORAGE_KEY = "legumex_auth"
const sessionSchema = z.object({
    token: z.string().min(1),
    user: z.object({ id: z.number().int().positive(), name: z.string().min(1), username: z.string().min(1),
        role: z.string().optional(), permissions: z.array(z.string()), representedCarrierId: z.number().int().positive().nullable().optional(),
        plantId: z.number().int().positive().nullable().optional(), plant: plantSchema.nullable().optional() }),
})

export type AuthenticatedUser = {
    id: number
    name: string
    username: string
    role?: string
    permissions: string[]
    representedCarrierId?: number | null
    plantId?: number | null
    plant?: Plant | null
}

export type AuthSession = {
    token: string
    user: AuthenticatedUser
}

export function getStoredSession(): AuthSession | null {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY)
        if (!storedData) return null
        const session = JSON.parse(storedData) as AuthSession
        // Older sessions omitted these claims. Only menu visibility uses them;
        // the API continues to verify the JWT and enforce authorization.
        if (!Array.isArray(session.user.permissions) || typeof session.user.role !== "string") {
            let permissions: string[] = []
            try {
                const payload = session.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
                const claims = JSON.parse(atob(payload))
                if (typeof session.user.role !== "string" && typeof claims.roleName === "string") session.user.role = claims.roleName
                if (Array.isArray(claims.permissions)) {
                    permissions = claims.permissions.filter((value: unknown): value is string => typeof value === "string")
                }
            } catch {
                // Malformed claims grant no menu permissions.
            }
            if (!Array.isArray(session.user.permissions)) session.user.permissions = permissions
        }
        const parsed = sessionSchema.safeParse(session)
        return parsed.success ? parsed.data as AuthSession : null
    } catch {
        return null
    }
}

export function storeSession(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
    localStorage.removeItem(STORAGE_KEY)
}
