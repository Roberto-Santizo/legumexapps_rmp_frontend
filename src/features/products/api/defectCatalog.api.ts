import { z } from "zod"
import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { esquemaRespuestaLista, esquemaRespuestaMutacion } from "@/shared/api/respuestaApi.esquema"

const defectCatalogSchema = z.object({ id: z.number().int().positive(), name: z.string(), activo: z.boolean() })
const listSchema = esquemaRespuestaLista(defectCatalogSchema)
const mutationSchema = esquemaRespuestaMutacion(defectCatalogSchema)
export type DefectCatalogEntry = z.infer<typeof defectCatalogSchema>

export async function listDefectCatalogApi() {
    try { return listSchema.parse((await api.get("/products/defect-catalog")).data) }
    catch (error) { manejarErrorApi(error) }
}

export async function createDefectCatalogApi(name: string) {
    try { return mutationSchema.parse((await api.post("/products/defect-catalog", { name })).data) }
    catch (error) { manejarErrorApi(error) }
}
