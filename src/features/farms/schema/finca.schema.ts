import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"

export const fincaSchema = esquemaCatalogoBase.extend({
    name: z.string(),
})

export type Finca = z.infer<typeof fincaSchema>

export const fincaFormSchema = z.object({
    name: z.string().trim().min(1, "El nombre de la finca es obligatorio").max(255, "Máximo 255 caracteres"),
})

export type FincaFormInput = z.infer<typeof fincaFormSchema>
