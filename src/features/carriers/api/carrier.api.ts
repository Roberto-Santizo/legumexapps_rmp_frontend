import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import {
    esquemaRespuestaLista,
    esquemaRespuestaListaPaginada,
    esquemaRespuestaItem,
    esquemaRespuestaMutacion,
    esquemaRespuestaMensaje,
} from "@/shared/api/respuestaApi.esquema"
import { carrierSchema } from "@/features/carriers/schema/carrier.schema"
import type { CarrierFormInput } from "@/features/carriers/schema/carrier.schema"

const listaTransportistasSchema = esquemaRespuestaLista(carrierSchema)
const listaTransportistasPaginadaSchema = esquemaRespuestaListaPaginada(carrierSchema)
const transportistaSchema = esquemaRespuestaItem(carrierSchema)
const mutacionTransportistaSchema = esquemaRespuestaMutacion(carrierSchema)

export async function listCarriersApi(search?: string) {
    try {
        const { data } = await api.get("/carriers", { params: { all: true, ...(search ? { search } : {}) } })
        return listaTransportistasSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listCarriersWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/carriers", { params: { page, search: search || undefined, includeInactive: true } })
        return listaTransportistasPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getCarrierApi(id: number) {
    try {
        const { data } = await api.get(`/carriers/${id}`)
        return transportistaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createCarrierApi(formData: CarrierFormInput) {
    try {
        const { data } = await api.post("/carriers", formData)
        return mutacionTransportistaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function updateCarrierApi({ id, ...formData }: CarrierFormInput & { id: number }) {
    try {
        const { data } = await api.patch(`/carriers/${id}`, formData)
        return mutacionTransportistaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function deleteCarrierApi(id: number) {
    try {
        const { data } = await api.delete(`/carriers/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function toggleCarrierEstadoApi({ id, activo }: { id: number; activo: boolean }) {
    try {
        const { data } = await api.patch(`/carriers/${id}/status`, { activo })
        return mutacionTransportistaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}
