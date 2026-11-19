import type { PestRule, PestEvaluation } from "../schema/pestEvaluation.schema"

export function formatPestBasketRange(rule: PestRule): string {
    return rule.maxBaskets === null ? `más de ${rule.minBaskets - 1}` : `${rule.minBaskets}–${rule.maxBaskets}`
}

// The server provides the rule and recalculates the final result on save.
export function calculatePestPreview(rule: PestRule | null, inspection: { wormCount: number | null; aphidHeadsCount: number | null } | null | undefined): PestEvaluation | null {
    if (!rule || !inspection || ![inspection.wormCount, inspection.aphidHeadsCount].every(value => value !== null && Number.isInteger(value) && value >= 0 && value <= 2147483647)) return null
    const wormCount = inspection.wormCount!, aphidHeadsCount = inspection.aphidHeadsCount!
    const reasons: string[] = []
    if (wormCount >= rule.wormRejectionCount) reasons.push(`Consignado por cantidad de gusanos: ${wormCount} encontrados en muestra de ${rule.samplePounds} lb (fuera de tolerancia desde ${rule.wormRejectionCount}).`)
    if (aphidHeadsCount >= rule.aphidRejectionCount) reasons.push(`Consignado por cabezas con áfidos: ${aphidHeadsCount} encontradas en muestra de ${rule.samplePounds} lb (fuera de tolerancia desde ${rule.aphidRejectionCount}).`)
    return { rule: { ...rule }, wormCount, aphidHeadsCount,
        result: reasons.length ? "out_of_tolerance" : wormCount > 0 || aphidHeadsCount > 0 ? "correction_required" : "accepted", reasons }
}
