import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import {
    esquemaRespuestaLista,
    esquemaRespuestaListaPaginada,
    esquemaRespuestaItem,
    esquemaRespuestaMutacion,
    esquemaRespuestaMensaje,
} from "@/shared/api/respuestaApi.esquema"
import { basketSchema } from "@/features/baskets/schema/basket.schema"
import type { BasketFormInput } from "@/features/baskets/schema/basket.schema"

const listaCanastasSchema = esquemaRespuestaLista(basketSchema)
const listaCanastasPaginadaSchema = esquemaRespuestaListaPaginada(basketSchema)
const canastaSchema = esquemaRespuestaItem(basketSchema)
const mutacionCanastaSchema = esquemaRespuestaMutacion(basketSchema)

export async function listBasketsApi(search?: string) {
    try {
        const { data } = await api.get("/baskets", { params: { all: true, ...(search ? { search } : {}) } })
        return listaCanastasSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listBasketsWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/baskets", { params: { page, search: search || undefined } })
        return listaCanastasPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getBasketApi(id: number) {
    try {
        const { data } = await api.get(`/baskets/${id}`)
        return canastaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createBasketApi(formData: BasketFormInput) {
    try {
        const { data } = await api.post("/baskets", formData)
        return mutacionCanastaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function updateBasketApi({ id, ...formData }: BasketFormInput & { id: number }) {
    try {
        const { data } = await api.patch(`/baskets/${id}`, formData)
        return mutacionCanastaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function deleteBasketApi(id: number) {
    try {
        const { data } = await api.delete(`/baskets/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}
