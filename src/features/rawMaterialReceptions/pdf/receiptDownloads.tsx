import { pdf } from "@react-pdf/renderer"
import { zipSync } from "fflate"
import { getReceptionDownloadDocumentApi, listReceptionDocumentIdsApi } from "../api/rmReception.api"
import type { RmReceptionFilters } from "../api/rmReception.api"
import type { RmReception } from "../schema/rmReception.schema"
import { BoletaPdfDocument } from "./BoletaPdfDocument"
import { QualityPdfDocument } from "@/features/qualityEvaluations/pdf/QualityPdfDocument"
import { buildQualityDocument } from "@/features/qualityEvaluations/pdf/qualityDocument.model"

export type ReceiptDownloadKind = "both" | "receipt" | "quality"
type PdfFile = { name: string; blob: Blob }

export async function receiptPdfFiles(boleta: RmReception, kind: ReceiptDownloadKind, signal?: AbortSignal): Promise<PdfFile[]> {
    const files: PdfFile[] = []
    signal?.throwIfAborted()
    if (kind !== "quality") {
        files.push({ name: `LX2-${boleta.id}.pdf`, blob: await pdf(<BoletaPdfDocument boleta={boleta} />).toBlob() })
    }
    signal?.throwIfAborted()
    // Use the latest saved evaluation, as in the individual document view.
    const quality = boleta.qualityControlDocs?.slice().sort((a, b) => b.id - a.id)[0]
    if (kind !== "receipt" && quality) {
        const model = buildQualityDocument(boleta, quality)
        files.push({ name: `${model.number}_${model.reference}.pdf`, blob: await pdf(<QualityPdfDocument model={model} />).toBlob() })
    }
    return files
}

export async function prepareReceiptDownload({ id, filters, kind, signal, onProgress }: {
    id?: number
    filters: RmReceptionFilters
    kind: ReceiptDownloadKind
    signal: AbortSignal
    onProgress: (message: string) => void
}) {
    signal.throwIfAborted()
    if (id === undefined && (!filters.startDate || !filters.endDate)) throw new Error("Selecciona las fechas Desde y Hasta para descargar el grupo.")
    onProgress("Consultando las boletas filtradas...")
    const ids = id !== undefined ? [id] : await listReceptionDocumentIdsApi(filters, signal)
    signal.throwIfAborted()
    if (!ids.length) throw new Error("No se encontraron boletas con esos filtros.")
    const files: Record<string, Uint8Array> = {}
    let fileCount = 0, missingQuality = 0, bytes = 0
    for (const [index, receiptId] of ids.entries()) {
        signal.throwIfAborted()
        onProgress(`Preparando boleta ${index + 1} de ${ids.length}...`)
        try {
            const { data: receipt } = await getReceptionDownloadDocumentApi(receiptId, signal)
            signal.throwIfAborted()
            if (kind !== "receipt" && !receipt.qualityControlDocs?.length) missingQuality++
            const generated = await receiptPdfFiles(receipt, kind, signal)
            signal.throwIfAborted()
            if (id !== undefined && generated.length === 1) {
                return { blob: generated[0].blob, filename: generated[0].name, fileCount: 1, missingQuality }
            }
            for (const file of generated) {
                bytes += file.blob.size
                if (bytes > 100 * 1024 * 1024) throw new Error("Los archivos superan 100 MB. Reduce el rango o agrega filtros.")
                const folder = file.name.startsWith("LX2-") ? "amarillas" : "calidad"
                files[`${folder}/${file.name}`] = new Uint8Array(await file.blob.arrayBuffer())
                fileCount++
            }
        } catch (error) {
            signal.throwIfAborted()
            throw new Error(`No se pudo preparar LX2-${receiptId}. ${error instanceof Error ? error.message : "Intenta nuevamente."}`)
        }
    }
    if (!fileCount) throw new Error("Las boletas seleccionadas aún no tienen evaluación de calidad.")
    signal.throwIfAborted()
    onProgress("Preparando archivo ZIP...")
    // PDF streams are already compressed; storing them avoids blocking compression work.
    const archive = zipSync(files, { level: 0 })
    return {
        blob: new Blob([new Uint8Array(archive)], { type: "application/zip" }),
        filename: id !== undefined ? `boletas_LX2-${id}.zip` : `boletas_${filters.startDate}_${filters.endDate}_${kind}.zip`,
        fileCount, missingQuality,
    }
}
