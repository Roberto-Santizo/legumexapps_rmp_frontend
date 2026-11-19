import type { RmReception } from "@/features/rawMaterialReceptions/schema/rmReception.schema"

export type ColumnaDatos = {
    pesoBruto: number
    cantidadCanastas: number
    pesoPorCanasta: number
    tara: number
    pesoNeto: number
    porcentajeCalidad: number | null
    libras: number | null
    libraLabel: string
    qualityDefinedInPlant?: boolean
}

export function numeroDocumento(id: number): string {
    return `LX2-${id}`
}

export function numeroBoleta(id: number): string {
    return `#${id.toString().padStart(6, "0")}`
}

export function formatNumero(value: number | null | undefined): string {
    return value !== null && value !== undefined && Number.isFinite(value)
        ? value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : "—"
}

type FieldDataReception = RmReception["fieldDataReceptions"][number]
type ProdDataReception = RmReception["prodDataReceptions"][number]

export function construirDatosCampo(detalle: FieldDataReception): ColumnaDatos {
    return {
        pesoBruto: detalle.weight,
        cantidadCanastas: detalle.totalBaskets,
        pesoPorCanasta: detalle.totalBaskets > 0 ? detalle.weightBaskets / detalle.totalBaskets : 0,
        tara: detalle.weightBaskets,
        pesoNeto: detalle.netWeight,
        porcentajeCalidad: detalle.qualityPercentage,
        libras: detalle.validPounds,
        libraLabel: "Libras a pagar",
        qualityDefinedInPlant: detalle.qualityDefinedInPlant ?? false,
    }
}

export function construirDatosPlanta(detalle: ProdDataReception | undefined): ColumnaDatos | null {
    if (!detalle) return null
    return {
        pesoBruto: detalle.grossWeight,
        cantidadCanastas: detalle.totalBaskets,
        pesoPorCanasta: detalle.totalBaskets > 0 ? detalle.weightBaskets / detalle.totalBaskets : 0,
        tara: detalle.weightBaskets,
        pesoNeto: detalle.netWeight,
        porcentajeCalidad: detalle.qualityPercentage,
        libras: detalle.validPounds,
        libraLabel: "Libras validadas",
    }
}

export type Diferencias = {
    pesoBruto: number
    tara: number
    pesoNeto: number
    libras: number | null
}

export function calcularDiferencias(campo: ColumnaDatos, planta: ColumnaDatos): Diferencias {
    return {
        pesoBruto: campo.pesoBruto - planta.pesoBruto,
        tara: campo.tara - planta.tara,
        pesoNeto: campo.pesoNeto - planta.pesoNeto,
        libras: campo.libras !== null && planta.libras !== null ? campo.libras - planta.libras : null,
    }
}
