import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"

export const carrierSchema = esquemaCatalogoBase.extend({
    code: z.string(),
    name: z.string(),
})

export const carrierFormSchema = z.object({
    code: z.string().trim().min(1, "El código es obligatorio").max(255, "Máximo 255 caracteres"),
    name: z.string().trim().min(1, "El nombre es obligatorio").max(255, "Máximo 255 caracteres"),
})

export type Carrier = z.infer<typeof carrierSchema>
export type CarrierFormInput = z.infer<typeof carrierFormSchema>
