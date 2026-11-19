import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { esquemaRespuestaLista, esquemaRespuestaListaPaginada, esquemaRespuestaMutacion, esquemaRespuestaItem, esquemaRespuestaMensaje } from "@/shared/api/respuestaApi.esquema"
import { fincaSchema } from "@/features/farms/schema/finca.schema"
import type { FincaFormInput } from "@/features/farms/schema/finca.schema"

const listaFincasSchema = esquemaRespuestaLista(fincaSchema)
const listaFincasPaginadaSchema = esquemaRespuestaListaPaginada(fincaSchema)
const mutacionFincaSchema = esquemaRespuestaMutacion(fincaSchema)
const fincaItemSchema = esquemaRespuestaItem(fincaSchema)

export async function listFincasApi() {
    try {
        const { data } = await api.get("/farms", { params: { all: true } })
        return listaFincasSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listFincasWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/farms", { params: { page: page ?? 1, search: search || undefined } })
        return listaFincasPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createFincaApi(payload: FincaFormInput) {
    try {
        const { data } = await api.post("/farms", payload)
        return mutacionFincaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getFincaApi(id: number) {
    try {
        const { data } = await api.get(`/farms/${id}`)
        return fincaItemSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function updateFincaApi({ id, ...payload }: FincaFormInput & { id: number }) {
    try {
        const { data } = await api.patch(`/farms/${id}`, payload)
        return mutacionFincaSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function deleteFincaApi(id: number) {
    try {
        const { data } = await api.delete(`/farms/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) { manejarErrorApi(error) }
}
