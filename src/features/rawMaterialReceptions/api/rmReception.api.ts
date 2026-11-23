import api from "@/shared/api/api"
import { z } from "zod"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { esquemaRespuestaListaPaginada, esquemaRespuestaItem, esquemaRespuestaMutacion } from "@/shared/api/respuestaApi.esquema"
import { rmReceptionSchema } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import type {
    EditFieldPayload,
    EditReceptionPayload,
    CreateRmReceptionPayload,
    CompleteReceptionPayload,
    ESTADOS_BOLETA,
} from "@/features/rawMaterialReceptions/schema/rmReception.schema"

const listaBoletasPaginadaSchema = esquemaRespuestaListaPaginada(rmReceptionSchema)
const boletaSchema = esquemaRespuestaItem(rmReceptionSchema)
const mutacionBoletaSchema = esquemaRespuestaMutacion(rmReceptionSchema)

export type RmReceptionFilters = {
    receiptNumber?: string
    grn?: string
    page?: number
    date?: string
    startDate?: string
    endDate?: string
    producer?: string
    producerId?: number
    inspector?: string
    plate?: string
    carrier?: string
    status?: (typeof ESTADOS_BOLETA)[number] | ""
}

export async function listRmReceptionsApi(filters?: RmReceptionFilters) {
    try {
        const params: Record<string, string | number> = { limit: 10 }
        if (filters?.receiptNumber) params.receiptNumber = filters.receiptNumber
        if (filters?.grn?.trim()) params.grn = filters.grn.trim()
        if (filters?.page) params.page = filters.page
        if (filters?.date) params.date = filters.date
        if (filters?.startDate) params.startDate = filters.startDate
        if (filters?.endDate) params.endDate = filters.endDate
        if (filters?.producer) params.producer = filters.producer
        if (filters?.inspector) params.inspector = filters.inspector
        if (filters?.plate) params.plate = filters.plate
        if (filters?.carrier) params.carrier = filters.carrier
        if (filters?.status) params.status = filters.status

        const { data } = await api.get("/rm-receptions", { params })
        return listaBoletasPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createRmReceptionApi(payload: CreateRmReceptionPayload) {
    try {
        const { data } = await api.post("/rm-receptions", payload)
        return mutacionBoletaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getRmReceptionApi(id: number) {
    try {
        const { data } = await api.get(`/rm-receptions/${id}`)
        return boletaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getReceptionDocumentApi(id: number, signal?: AbortSignal) {
    try {
        const { data } = await api.get(`/rm-receptions/${id}/document`, { signal })
        return boletaSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function getReceptionDownloadDocumentApi(id: number, signal?: AbortSignal) {
    try {
        const { data } = await api.get(`/rm-receptions/${id}/download-document`, { signal })
        return boletaSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

const productoresDescargaSchema = z.object({ data: z.array(z.object({
    id: z.number().int().positive(), name: z.string(), code: z.string().nullable().optional(), activo: z.boolean(),
})) })
export type DownloadProducer = z.infer<typeof productoresDescargaSchema>["data"][number]

// Productores para filtrar descargas; usa el permiso de descarga, no el de catálogo.
export async function listDownloadProducersApi() {
    try {
        const { data } = await api.get("/rm-receptions/documents/producers")
        return productoresDescargaSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function searchReceptionDownloadsApi(filters: RmReceptionFilters, signal?: AbortSignal) {
    try {
        const { data } = await api.get("/rm-receptions/documents/search", { params: { ...filters, limit: 10 }, signal })
        return listaBoletasPaginadaSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

const documentIdsSchema = z.object({ data: z.array(z.number().int().positive()).max(200) })

export async function listReceptionDocumentIdsApi(filters: RmReceptionFilters, signal?: AbortSignal) {
    try {
        const { page: _page, ...params } = filters
        const { data } = await api.get("/rm-receptions/documents", { params, signal })
        return documentIdsSchema.parse(data).data
    } catch (error) { manejarErrorApi(error) }
}

export async function completeReceptionApi({ id, ...payload }: CompleteReceptionPayload & { id: number }) {
    try {
        const { data } = await api.patch(`/rm-receptions/${id}/reception`, payload)
        return mutacionBoletaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function assignGrnApi({ id, grnNumber }: { id: number; grnNumber: string }) {
    try {
        const { data } = await api.patch(`/rm-receptions/${id}/grn`, { grnNumber })
        return mutacionBoletaSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function editFieldApi(id: number, payload: EditFieldPayload) {
    try {
        const { data } = await api.patch(`/rm-receptions/${id}/field`, payload)
        return mutacionBoletaSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function editReceptionApi(id: number, payload: EditReceptionPayload) {
    try {
        const { data } = await api.patch(`/rm-receptions/${id}/reception/correction`, payload)
        return mutacionBoletaSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}
