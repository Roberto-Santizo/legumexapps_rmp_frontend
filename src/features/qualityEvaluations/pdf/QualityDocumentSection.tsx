import { useEffect, useMemo } from "react"
import { usePDF } from "@react-pdf/renderer"
import { Download } from "lucide-react"
import type { RmReception } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import type { QualityDocument } from "../schema/qualityDocument.schema"
import { Button } from "@/shared/component/button.component"
import { buildQualityDocument } from "./qualityDocument.model"
import { QualityPdfDocument } from "./QualityPdfDocument"
import { QualityDocumentPreview } from "./QualityDocumentPreview"

export function QualityDocumentSection({ boleta, doc }: { boleta: RmReception; doc: QualityDocument }) {
    const model = useMemo(() => buildQualityDocument(boleta, doc), [boleta, doc])
    const document = useMemo(() => <QualityPdfDocument model={model} />, [model])
    const [instance, updateDocument] = usePDF()
    useEffect(() => { updateDocument(document) }, [document, updateDocument])
    const ready = !!instance.url && !instance.loading && !instance.error
    return <section className="space-y-4 border-t border-border-light pt-6" aria-label={`Documento de calidad ${model.number}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-bold text-dark">Evaluación de calidad</h2><p className="text-sm text-text-tertiary">{model.number} · Referencia {model.reference}</p></div>
            <a href={ready ? instance.url! : undefined} download={`${model.number}_${model.reference}.pdf`}>
                <Button type="button" disabled={!ready}><Download size={18} />{ready ? "Descargar evaluación PDF" : "Preparando evaluación..."}</Button>
            </a>
        </div>
        <QualityDocumentPreview model={model} />
        {instance.error && <p role="alert" className="text-sm text-error-fg">No se pudo preparar el PDF de calidad. Vuelve a abrir el documento para intentarlo nuevamente.</p>}
    </section>
}
