import { z } from "zod"
import { pestEvaluationSchema } from "./pestEvaluation.schema"

export const qualityDocumentSchema = z.object({
    id: z.number().int(), docDate: z.string(), netWeight: z.number(), totalBaskets: z.number(),
    sampleUnits: z.string(), harvestDocNumber: z.string(), percentage: z.number(), validPounds: z.number(),
    ph: z.number().nullable(), brix: z.number().nullable(), observations: z.string().nullable(),
    inspectorSignature: z.string(), evaluatorName: z.string().nullable().optional(),
    pestEvaluation: pestEvaluationSchema.nullable().optional(),
    qualityControlDefects: z.array(z.object({
        id: z.number().int(), defectName: z.string().nullable().optional(),
        input: z.number(), tolerancePercentage: z.number(), result: z.number(),
    })),
})
export type QualityDocument = z.infer<typeof qualityDocumentSchema>
