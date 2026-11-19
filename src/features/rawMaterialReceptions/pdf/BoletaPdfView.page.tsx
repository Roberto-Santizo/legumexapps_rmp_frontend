import { useEffect, useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { usePDF } from "@react-pdf/renderer"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { getReceptionDocumentApi } from "@/features/rawMaterialReceptions/api/rmReception.api"
import { BoletaPdfDocument } from "@/features/rawMaterialReceptions/pdf/BoletaPdfDocument"
import { BoletaResumen } from "@/features/rawMaterialReceptions/pdf/BoletaResumen.component"
import { numeroDocumento } from "@/features/rawMaterialReceptions/pdf/boletaDatos.util"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { Button } from "@/shared/component/button.component"
import { QualityDocumentSection } from "@/features/qualityEvaluations/pdf/QualityDocumentSection"

export function BoletaPdfView() {
    const { id } = useParams()
    const rmReceptionId = Number(id)

    const boletaQuery = useQuery({
        queryKey: ["rm-receptions", rmReceptionId, "document"],
        queryFn: () => getReceptionDocumentApi(rmReceptionId),
    })

    const boleta = boletaQuery.data?.data

    const documento = useMemo(() => (boleta ? <BoletaPdfDocument boleta={boleta} /> : null), [boleta])
    const [instance, updateDocument] = usePDF()

    useEffect(() => {
        if (documento) updateDocument(documento)
    }, [documento, updateDocument])

    if (boletaQuery.isLoading) return <LoadingSpinner />
    if (boletaQuery.isError || !boleta)
        return (
            <div className="mx-auto max-w-2xl space-y-4 text-center">
                <p className="text-error-fg">{boletaQuery.error?.message ?? "No se pudo cargar la boleta."}</p>
                <Link to="/boletas" className="text-sm font-semibold text-primary-dark underline">
                    Volver a boletas
                </Link>
            </div>
        )

    const nombreArchivo = `${numeroDocumento(boleta.id)}.pdf`
    const pdfListo = !!instance.url && !instance.loading

    return (
        <div className="mx-auto max-w-[1320px] space-y-6 pb-10">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-dark">Recibo de materia prima</h1>
                        <p className="text-sm text-text-tertiary">Boleta #{boleta.id.toString().padStart(6, "0")}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to="/boletas"
                        className="flex h-11 items-center gap-1.5 rounded-[10px] border-[1.5px] border-border-light px-4 text-sm font-semibold text-dark transition hover:border-dark"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </Link>
                    <a href={pdfListo ? instance.url! : undefined} download={nombreArchivo} className="shrink-0">
                        <Button type="button" disabled={!pdfListo}>
                            <Download size={18} />
                            {pdfListo ? "Descargar boleta PDF" : "Preparando PDF..."}
                        </Button>
                    </a>
                </div>
            </div>

            <BoletaResumen boleta={boleta} />
            {instance.error && <p role="alert" className="text-sm text-error-fg">No se pudo preparar el PDF. Vuelve a abrir la boleta para intentar nuevamente.</p>}
            {boleta.qualityControlDocs?.map(doc => <QualityDocumentSection key={doc.id} boleta={boleta} doc={doc} />)}
        </div>
    )
}
