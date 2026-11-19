import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"

export const varietyProductSchema = esquemaCatalogoBase.extend({
    name: z.string(),
})

export const varietyProductFormSchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(255, "Máximo 255 caracteres"),
})

export type VarietyProduct = z.infer<typeof varietyProductSchema>
export type VarietyProductFormInput = z.infer<typeof varietyProductFormSchema>
