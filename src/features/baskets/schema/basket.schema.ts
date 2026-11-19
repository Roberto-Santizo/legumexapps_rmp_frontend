import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"

export const basketSchema = esquemaCatalogoBase.extend({
    code: z.string(),
    weight: z.number(),
})

export const basketFormSchema = z.object({
    code: z.string().trim().min(1, "El código es obligatorio").max(255, "Máximo 255 caracteres"),
    weight: z.number().positive("El peso debe ser mayor a 0"),
})

export type Basket = z.infer<typeof basketSchema>
export type BasketFormInput = z.infer<typeof basketFormSchema>
