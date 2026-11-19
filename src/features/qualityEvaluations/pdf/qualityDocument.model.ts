import type { RmReception } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import type { QualityDocument } from "../schema/qualityDocument.schema"
import { formatDecimal } from "@/shared/utils/formatDecimal"
import { formatGuatemalaDate } from "@/shared/utils/guatemalaDate"

export function buildQualityDocument(boleta: RmReception, doc: QualityDocument) {
    const field = boleta.fieldDataReceptions[0]
    return {
        number: `LXC-${doc.id}`, reference: `LX2-${boleta.id}`,
        date: formatGuatemalaDate(doc.docDate),
        info: [
            ["PRODUCTOR", field?.producer.name ?? "", "PRODUCTO", field?.product.name ?? ""],
            ["VARIEDAD", field?.product.varietyProduct?.name ?? "", "CDP", field?.cdp?.name ?? ""],
            ["GRN", boleta.grn ?? "", "NO. DE CANASTAS", String(doc.totalBaskets)],
            ["PESO NETO", formatDecimal(doc.netWeight), "TAMAÑO DE LA MUESTRA", doc.sampleUnits],
        ],
        defects: doc.qualityControlDefects,
        total: Math.round((doc.qualityControlDefects.reduce((sum, defect) => sum + defect.result, 0) + Number.EPSILON) * 100) / 100,
        percentage: doc.percentage, observations: doc.observations ?? "",
        pestEvaluation: doc.pestEvaluation ?? null, qualityReasons: boleta.qualityReasons ?? [],
        signature: doc.inspectorSignature, evaluator: doc.evaluatorName ?? "",
    }
}
export type QualityDocumentModel = ReturnType<typeof buildQualityDocument>
export const qualityDocumentCode = "FOR-CI-02"
export const qualityDocumentFooter = "Agroindustria Legumex · Chimaltenango, Guatemala"
