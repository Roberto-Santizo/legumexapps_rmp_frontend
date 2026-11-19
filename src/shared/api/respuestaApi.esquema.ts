import { z } from "zod"

export function esquemaRespuestaLista<EsquemaItem extends z.ZodTypeAny>(esquemaItem: EsquemaItem) {
    return z.object({
        data: z.array(esquemaItem),
    })
}

const esquemaMetaPaginacion = z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
})

export function esquemaRespuestaListaPaginada<EsquemaItem extends z.ZodTypeAny>(esquemaItem: EsquemaItem) {
    return z.object({
        data: z.array(esquemaItem),
        meta: esquemaMetaPaginacion,
    })
}

export type MetaPaginacion = z.infer<typeof esquemaMetaPaginacion>

export function esquemaRespuestaItem<EsquemaItem extends z.ZodTypeAny>(esquemaItem: EsquemaItem) {
    return z.object({
        data: esquemaItem,
    })
}

export function esquemaRespuestaMutacion<EsquemaItem extends z.ZodTypeAny>(esquemaItem: EsquemaItem) {
    return z.object({
        message: z.string(),
        data: esquemaItem,
    })
}

export const esquemaRespuestaMensaje = z.object({
    message: z.string(),
})

export type RespuestaMensaje = z.infer<typeof esquemaRespuestaMensaje>
