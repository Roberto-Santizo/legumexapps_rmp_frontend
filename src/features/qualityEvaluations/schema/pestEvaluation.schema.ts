import { z } from "zod"

export const pestRuleSchema = z.object({
    version: z.string(), minBaskets: z.number().int().positive(), maxBaskets: z.number().int().positive().nullable(),
    samplePounds: z.number().positive(), wormRejectionCount: z.number().int().positive(), aphidRejectionCount: z.number().int().positive(),
})
export const pestEvaluationSchema = z.object({
    rule: pestRuleSchema, wormCount: z.number().int().nonnegative(), aphidHeadsCount: z.number().int().nonnegative(),
    sampleConfirmed: z.literal(true).optional(), result: z.enum(["accepted", "correction_required", "out_of_tolerance"]), reasons: z.array(z.string()),
})
export type PestRule = z.infer<typeof pestRuleSchema>
export type PestEvaluation = z.infer<typeof pestEvaluationSchema>
export const pestResultLabels = { accepted: "Aceptado", correction_required: "Necesita corrección / límite", out_of_tolerance: "Fuera de tolerancia / consignado" }
