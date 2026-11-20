import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"
import { varietyProductSchema } from "@/features/varietyProducts/schema/varietyProduct.schema"
import { normalizeDefectName } from "../utils/defectName"

export const productDefectFormSchema = z.object({
    id: z.number().int().positive().optional(),
    defectCatalogId: z.number().int().positive().nullable().optional(),
    name: z.string().trim().min(1, "Ingresa el nombre del defecto").max(255, "Máximo 255 caracteres"),
    tolerancePercentage: z.number({ error: "Ingresa un porcentaje válido" }).min(0, "Debe estar entre 0 y 100").max(100, "Debe estar entre 0 y 100"),
    activo: z.boolean(),
})

export const productSchema = esquemaCatalogoBase.extend({
    name: z.string(),
    varietyProductId: z.number().int(),
    acceptedPercentage: z.number(),
    evaluatePests: z.boolean().optional(),
    varietyProduct: varietyProductSchema.nullish(),
    defects: z.array(productDefectFormSchema.extend({ id: z.number().int() })).optional(),
})

export const productFormSchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(255, "Máximo 255 caracteres"),
    varietyProductId: z.string().min(1, "Selecciona una variedad"),
    acceptedPercentage: z.number({ error: "Ingresa un porcentaje válido" }).positive("Debe ser mayor que 0").max(100, "No puede ser mayor que 100"),
    evaluatePests: z.boolean().optional(),
    defects: z.array(productDefectFormSchema).max(200, "Máximo 200 defectos por producto").superRefine((defects, ctx) => {
        const names = new Set<string>()
        const catalogIds = new Set<number>()
        defects.forEach((defect, index) => {
            const name = normalizeDefectName(defect.name)
            if (names.has(name) || (defect.defectCatalogId != null && catalogIds.has(defect.defectCatalogId))) ctx.addIssue({ code: "custom", path: [index, "name"], message: "Este defecto ya está relacionado" })
            names.add(name)
            if (defect.defectCatalogId != null) catalogIds.add(defect.defectCatalogId)
        })
    }),
})

export type Product = z.infer<typeof productSchema>
export type ProductFormInput = z.infer<typeof productFormSchema>
