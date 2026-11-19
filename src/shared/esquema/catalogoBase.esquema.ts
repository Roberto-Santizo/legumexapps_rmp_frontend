import { z } from "zod"

export const esquemaCatalogoBase = z.object({
    id: z.number().int(),
    activo: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type CatalogoBase = z.infer<typeof esquemaCatalogoBase>
