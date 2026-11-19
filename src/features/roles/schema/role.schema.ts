import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"

export const roleSchema = esquemaCatalogoBase.extend({
    name: z.string(),
})

export const roleFormSchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
    permissionIds: z.array(z.number().int()),
})

export type Role = z.infer<typeof roleSchema>
export type RoleFormInput = z.infer<typeof roleFormSchema>
