import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import {
    esquemaRespuestaLista,
    esquemaRespuestaListaPaginada,
    esquemaRespuestaItem,
    esquemaRespuestaMutacion,
    esquemaRespuestaMensaje,
} from "@/shared/api/respuestaApi.esquema"
import { varietyProductSchema } from "@/features/varietyProducts/schema/varietyProduct.schema"
import type { VarietyProductFormInput } from "@/features/varietyProducts/schema/varietyProduct.schema"

const listaVariedadesSchema = esquemaRespuestaLista(varietyProductSchema)
const listaVariedadesPaginadaSchema = esquemaRespuestaListaPaginada(varietyProductSchema)
const variedadSchema = esquemaRespuestaItem(varietyProductSchema)
const mutacionVariedadSchema = esquemaRespuestaMutacion(varietyProductSchema)

export async function listVarietyProductsApi(search?: string) {
    try {
        const { data } = await api.get("/variety-products", { params: { all: true, ...(search ? { search } : {}) } })
        return listaVariedadesSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listVarietyProductsWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/variety-products", { params: { page, search: search || undefined } })
        return listaVariedadesPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getVarietyProductApi(id: number) {
    try {
        const { data } = await api.get(`/variety-products/${id}`)
        return variedadSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createVarietyProductApi(formData: VarietyProductFormInput) {
    try {
        const { data } = await api.post("/variety-products", formData)
        return mutacionVariedadSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function updateVarietyProductApi({ id, ...formData }: VarietyProductFormInput & { id: number }) {
    try {
        const { data } = await api.patch(`/variety-products/${id}`, formData)
        return mutacionVariedadSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function deleteVarietyProductApi(id: number) {
    try {
        const { data } = await api.delete(`/variety-products/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}
