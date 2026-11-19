import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"
import { carrierSchema } from "@/features/carriers/schema/carrier.schema"

export const plateSchema = esquemaCatalogoBase.extend({
    name: z.string(),
    maxGrossWeight: z.number().positive().nullable().optional(),
    carrierId: z.number().int(),
    carrier: carrierSchema.optional(),
})

export const plateFormSchema = z.object({
    name: z.string().trim().min(1, "La placa es obligatoria").max(255, "Máximo 255 caracteres"),
    carrierId: z.string().min(1, "Selecciona un transportista"),
    maxGrossWeight: z.number({ error: "Ingresa el peso bruto máximo del camión" }).positive("El peso bruto máximo debe ser mayor a cero"),
})

export type Plate = z.infer<typeof plateSchema>
export type PlateFormInput = z.infer<typeof plateFormSchema>
