import api from "@/shared/api/api"
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
    producer?: string
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

export async function getReceptionDocumentApi(id: number) {
    try {
        const { data } = await api.get(`/rm-receptions/${id}/document`)
        return boletaSchema.parse(data)
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
