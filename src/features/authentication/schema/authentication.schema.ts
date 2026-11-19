import { z } from "zod"
import { plantSchema } from "@/features/plants/schema/plant.schema"

export const loginSchema = z.object({
    username: z.string().trim().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
})

const authenticatedUserSchema = z.object({
    id: z.number().int(),
    name: z.string(),
    username: z.string(),
    role: z.string().optional(),
    permissions: z.array(z.string()).default([]),
    representedCarrierId: z.number().int().positive().nullable().optional(),
    plantId: z.number().int().positive().nullable().optional(),
    plant: plantSchema.nullable().optional(),
})

export const loginResponseSchema = z.object({
    message: z.string(),
    data: z.object({
        token: z.string(),
        user: authenticatedUserSchema,
    }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>
