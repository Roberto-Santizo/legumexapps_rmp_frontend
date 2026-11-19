import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import {
    esquemaRespuestaLista,
    esquemaRespuestaListaPaginada,
    esquemaRespuestaItem,
    esquemaRespuestaMutacion,
    esquemaRespuestaMensaje,
} from "@/shared/api/respuestaApi.esquema"
import { productSchema } from "@/features/products/schema/product.schema"
import type { ProductFormInput } from "@/features/products/schema/product.schema"

const listaProductosSchema = esquemaRespuestaLista(productSchema)
const listaProductosPaginadaSchema = esquemaRespuestaListaPaginada(productSchema)
const productoSchema = esquemaRespuestaItem(productSchema)
const mutacionProductoSchema = esquemaRespuestaMutacion(productSchema)

export type CreateProductPayload = {
    name: string
    varietyProductId: number
    acceptedPercentage: number
    evaluatePests?: boolean
    defects?: ProductFormInput["defects"]
}

export async function listProductsApi(search?: string) {
    try {
        const { data } = await api.get("/products", { params: { all: true, ...(search ? { search } : {}) } })
        return listaProductosSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listProductsWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/products", { params: { page, search: search || undefined, includeInactive: true } })
        return listaProductosPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getProductApi(id: number) {
    try {
        const { data } = await api.get(`/products/${id}`)
        return productoSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createProductApi(payload: CreateProductPayload) {
    try {
        const { data } = await api.post("/products", payload)
        return mutacionProductoSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function updateProductApi({ id, ...payload }: CreateProductPayload & { id: number }) {
    try {
        const { data } = await api.patch(`/products/${id}`, payload)
        return mutacionProductoSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function deleteProductApi(id: number) {
    try {
        const { data } = await api.delete(`/products/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function toggleProductEstadoApi({ id, activo }: { id: number; activo: boolean }) {
    try {
        const { data } = await api.patch(`/products/${id}/status`, { activo })
        return mutacionProductoSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}
