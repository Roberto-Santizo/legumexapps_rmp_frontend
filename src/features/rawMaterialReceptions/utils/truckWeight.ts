import { formatDecimal } from "@/shared/utils/formatDecimal"

export function truckGrossWeightError(plate: { name: string; maxGrossWeight?: number | null } | null | undefined, value: number | undefined): string | null {
    if (!plate) return null
    const maximum = plate.maxGrossWeight
    if (maximum == null || !Number.isFinite(maximum) || maximum <= 0) return `Configura el peso bruto máximo de la placa ${plate.name} antes de continuar.`
    if (value !== undefined && Number.isFinite(value) && value > maximum) return `El peso bruto supera el máximo de ${formatDecimal(maximum)} lb permitido para la placa ${plate.name}.`
    return null
}
