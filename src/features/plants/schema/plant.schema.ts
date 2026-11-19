import { z } from "zod"

export const plantSchema = z.object({
    id: z.number().int().positive(),
    code: z.enum(["LP", "LT"]),
    name: z.string(),
})

export type Plant = z.infer<typeof plantSchema>
