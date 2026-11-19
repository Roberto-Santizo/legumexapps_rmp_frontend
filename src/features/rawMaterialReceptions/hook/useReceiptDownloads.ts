import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { downloadFile } from "@/shared/utils/downloadFile"
import type { RmReceptionFilters } from "../api/rmReception.api"
import type { ReceiptDownloadKind } from "../pdf/receiptDownloads"

export function useReceiptDownloads() {
    const controller = useRef<AbortController | null>(null)
    const [progress, setProgress] = useState("")
    useEffect(() => () => controller.current?.abort(), [])

    async function download(filters: RmReceptionFilters, kind: ReceiptDownloadKind, id?: number) {
        if (controller.current) return
        const current = new AbortController()
        controller.current = current
        setProgress("Preparando descarga...")
        try {
            const { prepareReceiptDownload } = await import("../pdf/receiptDownloads")
            const result = await prepareReceiptDownload({ filters: { ...filters }, kind, id, signal: current.signal, onProgress: setProgress })
            current.signal.throwIfAborted()
            downloadFile(result.blob, result.filename)
            toast.success(`${result.fileCount} documento(s) descargado(s).`)
            if (result.missingQuality) toast.info(`${result.missingQuality} boleta(s) aún sin evaluación de calidad; se incluyeron los documentos disponibles.`)
        } catch (error) {
            if (!current.signal.aborted) toast.error(error instanceof Error ? error.message : "No se pudo preparar la descarga.")
        } finally {
            if (controller.current === current) {
                controller.current = null
                setProgress("")
            }
        }
    }

    function cancel() {
        controller.current?.abort()
        setProgress("Cancelando descarga...")
    }
    return { download, progress, cancel }
}
