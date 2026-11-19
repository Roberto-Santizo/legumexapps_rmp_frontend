import { z } from "zod"
import { rmReceptionSchema } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import { qualityDocumentSchema } from "./qualityDocument.schema"
import { pestRuleSchema } from "./pestEvaluation.schema"

export const qualityContextSchema = z.object({ data: z.object({
    boleta: rmReceptionSchema,
    defects: z.array(z.object({ id: z.number().int(), name: z.string(), tolerancePercentage: z.number(), activo: z.boolean() })),
    acceptedPercentage: z.number(), configurationVersion: z.string(),
    evaluation: qualityDocumentSchema.optional(),
    pestControl: z.object({ enabled: z.boolean(), rule: pestRuleSchema.nullable() }).optional(),
}) })

export const createQualityFormSchema = (editing = false, requiresPestInspection = false) => z.object({
    harvestDocNumber: z.string().trim().min(1, "Ingresa el número de hoja de cosechero").max(255),
    sampleUnits: z.number({ error: "Ingresa las unidades de muestra" }).int("Ingresa una cantidad entera")
        .positive("Las unidades de muestra deben ser mayores a cero").max(2147483647, "La cantidad de unidades de muestra supera el máximo permitido"),
    ph: z.number({ error: "Ingresa un pH válido" }).min(0).max(14, "El pH debe estar entre 0 y 14").nullable(),
    brix: z.number({ error: "Ingresa un valor Brix válido" }).min(0).max(100, "Brix debe estar entre 0 y 100").nullable(),
    observations: z.string().trim().max(20000, "Máximo 20,000 caracteres"),
    inspectorSignature: z.string().nullable().refine(value => editing || !!value, "La firma del evaluador es obligatoria"),
    pestInspection: z.object({
        wormCount: z.number({ error: "Ingresa la cantidad de gusanos" }).int("Ingresa un número entero").min(0, "Mínimo cero").max(2147483647).nullable(),
        aphidHeadsCount: z.number({ error: "Ingresa las cabezas con áfidos" }).int("Ingresa un número entero").min(0, "Mínimo cero").max(2147483647).nullable(),
    }).nullable().optional(),
    defects: z.array(z.object({
        defectId: z.number().int(), name: z.string(), tolerancePercentage: z.number(),
        input: z.number({ error: "Ingresa el porcentaje observado" }).min(0, "Mínimo 0 %").max(100, "Máximo 100 %"),
    })),
}).superRefine((value, ctx) => {
    if (!value.defects.length && !requiresPestInspection) ctx.addIssue({ code: "custom", path: ["defects"], message: "El producto necesita al menos un defecto activo para evaluarse" })
    if (requiresPestInspection) {
        if (value.pestInspection?.wormCount == null) ctx.addIssue({ code: "custom", path: ["pestInspection", "wormCount"], message: "Registra el conteo; ingresa cero si no encontraste gusanos" })
        if (value.pestInspection?.aphidHeadsCount == null) ctx.addIssue({ code: "custom", path: ["pestInspection", "aphidHeadsCount"], message: "Registra el conteo; ingresa cero si no encontraste cabezas con áfidos" })
    }
})

export const qualityFormSchema = createQualityFormSchema()

export type QualityFormInput = z.infer<typeof qualityFormSchema>
