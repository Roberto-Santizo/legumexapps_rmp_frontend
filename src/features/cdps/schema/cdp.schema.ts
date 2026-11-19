import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"
import { fincaSchema } from "@/features/farms/schema/finca.schema"

export const cdpSchema = esquemaCatalogoBase.extend({
    name: z.string(),
    fincaId: z.number().int(),
    finca: fincaSchema.optional(),
})

export const cdpFormSchema = z.object({
    name: z.string().trim().min(1, "El nombre del CDP es obligatorio").max(255, "Máximo 255 caracteres"),
    fincaId: z.string().min(1, "Selecciona una finca"),
})

export type Cdp = z.infer<typeof cdpSchema>
export type CdpFormInput = z.infer<typeof cdpFormSchema>

export type CreateCdpPayload = {
    name: string
    fincaId: number
}
