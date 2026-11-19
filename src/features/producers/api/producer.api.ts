import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { esquemaRespuestaLista, esquemaRespuestaListaPaginada, esquemaRespuestaMutacion, esquemaRespuestaItem, esquemaRespuestaMensaje } from "@/shared/api/respuestaApi.esquema"
import { producerSchema } from "@/features/producers/schema/producer.schema"
import type { ProducerFormInput } from "@/features/producers/schema/producer.schema"

const listaProductoresSchema = esquemaRespuestaLista(producerSchema)
const listaProductoresPaginadaSchema = esquemaRespuestaListaPaginada(producerSchema)
const mutacionProductorSchema = esquemaRespuestaMutacion(producerSchema)
const productorItemSchema = esquemaRespuestaItem(producerSchema)

export async function listProducersApi() {
    try {
        const { data } = await api.get("/producers", { params: { all: true } })
        return listaProductoresSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listProducersWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/producers", { params: { page: page ?? 1, search: search || undefined } })
        return listaProductoresPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createProducerApi(payload: ProducerFormInput) {
    try {
        const { data } = await api.post("/producers", payload)
        return mutacionProductorSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getProducerApi(id: number) {
    try {
        const { data } = await api.get(`/producers/${id}`)
        return productorItemSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function updateProducerApi({ id, ...payload }: ProducerFormInput & { id: number }) {
    try {
        const { data } = await api.patch(`/producers/${id}`, payload)
        return mutacionProductorSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function deleteProducerApi(id: number) {
    try {
        const { data } = await api.delete(`/producers/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) { manejarErrorApi(error) }
}
