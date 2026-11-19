import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import {
    esquemaRespuestaLista,
    esquemaRespuestaListaPaginada,
    esquemaRespuestaItem,
    esquemaRespuestaMutacion,
    esquemaRespuestaMensaje,
} from "@/shared/api/respuestaApi.esquema"
import { cdpSchema } from "@/features/cdps/schema/cdp.schema"
import type { CreateCdpPayload } from "@/features/cdps/schema/cdp.schema"

const listaCdpsSchema = esquemaRespuestaLista(cdpSchema)
const listaCdpsPaginadaSchema = esquemaRespuestaListaPaginada(cdpSchema)
const cdpItemSchema = esquemaRespuestaItem(cdpSchema)
const mutacionCdpSchema = esquemaRespuestaMutacion(cdpSchema)

export async function listCdpsApi(search?: string) {
    try {
        const { data } = await api.get("/cdps", { params: { all: true, ...(search ? { search } : {}) } })
        return listaCdpsSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listCdpsWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/cdps", { params: { page, search: search || undefined } })
        return listaCdpsPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getCdpApi(id: number) {
    try {
        const { data } = await api.get(`/cdps/${id}`)
        return cdpItemSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createCdpApi(payload: CreateCdpPayload) {
    try {
        const { data } = await api.post("/cdps", payload)
        return mutacionCdpSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function updateCdpApi({ id, ...payload }: CreateCdpPayload & { id: number }) {
    try {
        const { data } = await api.patch(`/cdps/${id}`, payload)
        return mutacionCdpSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function deleteCdpApi(id: number) {
    try {
        const { data } = await api.delete(`/cdps/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}
