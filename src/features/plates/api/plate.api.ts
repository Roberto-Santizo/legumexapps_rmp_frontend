import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import {
    esquemaRespuestaLista,
    esquemaRespuestaListaPaginada,
    esquemaRespuestaItem,
    esquemaRespuestaMutacion,
    esquemaRespuestaMensaje,
} from "@/shared/api/respuestaApi.esquema"
import { plateSchema } from "@/features/plates/schema/plate.schema"

const listaPlacasSchema = esquemaRespuestaLista(plateSchema)
const listaPlacasPaginadaSchema = esquemaRespuestaListaPaginada(plateSchema)
const placaSchema = esquemaRespuestaItem(plateSchema)
const mutacionPlacaSchema = esquemaRespuestaMutacion(plateSchema)

export type CreatePlatePayload = {
    name: string
    carrierId: number
    maxGrossWeight: number
}

export async function listPlatesApi(carrierId?: number | null, search?: string) {
    try {
        const { data } = await api.get("/plates", {
            params: { all: true, ...(carrierId ? { carrierId } : {}), ...(search ? { search } : {}) }
        })
        return listaPlacasSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listPlatesWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/plates", { params: { page, search: search || undefined } })
        return listaPlacasPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getPlateApi(id: number) {
    try {
        const { data } = await api.get(`/plates/${id}`)
        return placaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createPlateApi(payload: CreatePlatePayload) {
    try {
        const { data } = await api.post("/plates", payload)
        return mutacionPlacaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function updatePlateApi({ id, ...payload }: CreatePlatePayload & { id: number }) {
    try {
        const { data } = await api.patch(`/plates/${id}`, payload)
        return mutacionPlacaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function deletePlateApi(id: number) {
    try {
        const { data } = await api.delete(`/plates/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}
