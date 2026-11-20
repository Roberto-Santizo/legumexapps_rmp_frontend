import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"

export const basketSchema = esquemaCatalogoBase.extend({
    name: z.string(),
    weight: z.number(),
})

export const basketFormSchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(255, "Máximo 255 caracteres"),
    weight: z.number({ error: "Ingresa un peso numérico válido" }).nonnegative("El peso debe ser mayor o igual a 0"),
})

export type Basket = z.infer<typeof basketSchema>
export type BasketFormInput = z.infer<typeof basketFormSchema>
