import type { RmReception } from "../schema/rmReception.schema"
import { formatGuatemalaDate } from "@/shared/utils/guatemalaDate"
import { construirDatosCampo, construirDatosPlanta, calcularDiferencias, numeroDocumento } from "./boletaDatos.util"

export const receiptTheme = {
    background: "#fffbc4",
    ink: "#111111",
    documentNumber: "#ff2020",
    border: "#111111",
}

export const receiptCompany = {
    name: "Agroindustria Legumex,",
    location: "Chimaltenango Guatemala",
    phone: "PBX: 7824 9300",
    formCode: "R-PRO-MP-02",
}

export const qualityExemptionNotice = "Este producto no requiere evaluación por el departamento de Calidad."

export function formatReceiptNumber(value: number | null | undefined, decimals = false): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return ""
    return value.toLocaleString("en-US", { useGrouping: false, minimumFractionDigits: decimals || !Number.isInteger(value) ? 2 : 0, maximumFractionDigits: 2 })
}

export function buildReceiptModel(boleta: RmReception) {
    const field = boleta.fieldDataReceptions[0]
    const plant = boleta.prodDataReceptions[0]
    const fieldValues = field ? construirDatosCampo(field) : null
    const plantValues = construirDatosPlanta(plant)
    if (!boleta.requiresQualityEvaluation && plantValues) {
        plantValues.porcentajeCalidad = null
        plantValues.libras = null
    }
    return {
        number: numeroDocumento(boleta.id),
        qualityNotice: boleta.requiresQualityEvaluation ? "" : qualityExemptionNotice,
        date: formatGuatemalaDate(boleta.docDate),
        grn: boleta.grn ?? "",
        cdp: field?.cdp?.name ?? "",
        carrier: field?.carrier?.name ?? "",
        pilot: field?.pilotName ?? "",
        finca: boleta.finca.name,
        producer: field?.producer.name ?? "",
        plate: field?.plate?.name ?? "",
        product: field?.product.name ?? "",
        inspector: field?.inspectorName ?? "",
        variety: field?.product.varietyProduct?.name ?? "",
        field: fieldValues,
        plant: plantValues,
        differences: fieldValues && plantValues ? calcularDiferencias(fieldValues, plantValues) : null,
        signatures: [
            { label: "Firma Receptor", src: plant?.receptorSignature, name: plant?.receptorName ?? "" },
            ...(!boleta.deliveredToPlant ? [{ label: "Firma Piloto", src: field?.driverSignature }] : []),
            { label: "Firma Inspector", src: field?.inspectorSignature },
            ...(!boleta.deliveredToPlant ? [{ label: "Firma Productor", src: field?.prodSignature }] : []),
        ],
    }
}

export type ReceiptModel = ReturnType<typeof buildReceiptModel>
