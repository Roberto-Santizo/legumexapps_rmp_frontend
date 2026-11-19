import type { RmReception } from "../schema/rmReception.schema"

export const editRules = {
    field: { permission: "rawMaterialReceptions:editField", status: "pendiente_recepcion", counter: "fieldEditCount" },
    reception: { permission: "rawMaterialReceptions:editReception", status: "pendiente_evaluacion_calidad", counter: "receptionEditCount" },
    quality: { permission: "qualityEvaluations:edit", status: "pendiente_asignacion_grn", counter: "qualityEditCount" },
} as const

export function canEditStage(receipt: RmReception, stage: keyof typeof editRules, permissions: string[], roleName?: string) {
    if (stage === "field" && roleName?.trim().toLocaleLowerCase("es") === "campo") permissions = permissions.filter(permission => permission !== "rawMaterialReceptions:overrideEdit")
    if (stage === "field" && receipt.prodDataReceptions?.length && !permissions.includes("rawMaterialReceptions:overrideEdit")) return false
    if (permissions.includes("rawMaterialReceptions:overrideEdit")) return true
    const rule = editRules[stage]
    return permissions.includes(rule.permission) && receipt.status === rule.status && receipt.grn === null && receipt[rule.counter] < 2
}

export function canMutateReceipt(receipt: RmReception, user?: { id: number; role?: string; permissions?: string[]; representedCarrierId?: number | null } | null): boolean {
    if (user?.role?.trim().toLocaleLowerCase("es") !== "campo") return true
    if (user.permissions?.includes("rawMaterialReceptions:manageCarrier") && user.representedCarrierId) {
        return receipt.fieldDataReceptions?.some(field => field.carrier?.id === user.representedCarrierId) ?? false
    }
    return receipt.userId === user.id
}

export function receiptActionPermissions(receipt: RmReception, user?: { id: number; role?: string; permissions: string[]; representedCarrierId?: number | null } | null): string[] {
    const permissions = user?.permissions ?? []
    return canMutateReceipt(receipt, user) ? permissions
        : permissions.filter(permission => ["rawMaterialReceptions:view", "rawMaterialReceptions:viewHistory", "qualityEvaluations:view"].includes(permission))
}
