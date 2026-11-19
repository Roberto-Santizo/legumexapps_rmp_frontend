import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"
import { roleSchema } from "@/features/roles/schema/role.schema"
import { carrierSchema } from "@/features/carriers/schema/carrier.schema"
import { plantSchema } from "@/features/plants/schema/plant.schema"

export const userSchema = esquemaCatalogoBase.extend({
    name: z.string(),
    username: z.string(),
    roleId: z.number().int(),
    role: roleSchema,
    plantId: z.number().int().positive().nullable().optional(),
    plant: plantSchema.nullable().optional(),
    representedCarrierId: z.number().int().positive().nullable().optional(),
    representedCarrier: carrierSchema.nullable().optional(),
})

export const createUserFormSchema = z
    .object({
        name: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
        username: z.string().trim().min(3, "Mínimo 3 caracteres").max(40, "Máximo 40 caracteres"),
        password: z.string().min(8, "Mínimo 8 caracteres").max(100, "Máximo 100 caracteres"),
        confirmPassword: z.string().min(1, "Confirma la contraseña"),
        roleId: z.string().min(1, "Selecciona un rol"),
        plantId: z.string().optional(),
        representedCarrierId: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    })

export type User = z.infer<typeof userSchema>
export type CreateUserFormInput = z.infer<typeof createUserFormSchema>
export type CreateUserPayload = Omit<CreateUserFormInput, "confirmPassword" | "roleId" | "representedCarrierId" | "plantId"> & { roleId: number; representedCarrierId?: number | null; plantId?: number | null }
