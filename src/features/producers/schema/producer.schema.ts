import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"

export const producerSchema = esquemaCatalogoBase.extend({
    name: z.string(),
    code: z.string(),
})

export type Producer = z.infer<typeof producerSchema>

export const producerFormSchema = z.object({
    code: z.string().trim().min(1, "El código del productor es obligatorio").max(255, "Máximo 255 caracteres"),
    name: z.string().trim().min(1, "El nombre del productor es obligatorio").max(255, "Máximo 255 caracteres"),
})

export type ProducerFormInput = z.infer<typeof producerFormSchema>
