import { z } from "zod"
import { esquemaCatalogoBase } from "@/shared/esquema/catalogoBase.esquema"

export const permissionSchema = esquemaCatalogoBase.extend({
    name: z.string(),
    description: z.string().nullable(),
})

export type Permission = z.infer<typeof permissionSchema>
