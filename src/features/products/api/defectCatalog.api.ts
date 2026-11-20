import { z } from "zod"
import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { esquemaRespuestaLista, esquemaRespuestaMutacion } from "@/shared/api/respuestaApi.esquema"

const defectCatalogSchema = z.object({
    id: z.number().int().positive(), name: z.string(), activo: z.boolean(),
    aliases: z.array(z.object({ name: z.string(), normalizedName: z.string() })).default([]),
})
const listSchema = esquemaRespuestaLista(defectCatalogSchema)
const mutationSchema = esquemaRespuestaMutacion(defectCatalogSchema)
export type DefectCatalogEntry = z.infer<typeof defectCatalogSchema>
export type DefectCatalogInput = { name: string }

export async function listDefectCatalogApi(includeInactive = false) {
    try { return listSchema.parse((await api.get("/products/defect-catalog", { params: { includeInactive } })).data) }
    catch (error) { manejarErrorApi(error) }
}

export async function createDefectCatalogApi(input: DefectCatalogInput) {
    try { return mutationSchema.parse((await api.post("/products/defect-catalog", input)).data) }
    catch (error) { manejarErrorApi(error) }
}

export async function updateDefectCatalogApi({ id, ...input }: DefectCatalogInput & { id: number; activo: boolean }) {
    try { return mutationSchema.parse((await api.patch(`/products/defect-catalog/${id}`, input)).data) }
    catch (error) { manejarErrorApi(error) }
}
