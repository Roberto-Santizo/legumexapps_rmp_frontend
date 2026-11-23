import type { CSSProperties, ReactNode } from "react"
import { CircleCheck } from "lucide-react"
import { LegumexLogoStacked } from "@/shared/component/LegumexLogoStacked"
import type { RmReception } from "../schema/rmReception.schema"
import type { ColumnaDatos } from "./boletaDatos.util"
import { buildReceiptModel, formatReceiptNumber as number, receiptCompany, receiptTheme } from "./boletaDocumento.model"
import "../styles/boletaDocumento.css"

function LineField({ label, value }: { label: string; value: string }) {
    return <div className="receipt-line-field"><span>{label}</span><span className="receipt-line-value">{value || "\u00a0"}</span></div>
}

function Box({ value, caption, note }: { value: number | null | undefined; caption?: string; note?: string }) {
    return (
        <div className="receipt-value-group">
            <div className="receipt-value">{number(value) || "\u00a0"}</div>
            {caption && <div className="receipt-caption">{caption}</div>}
            {note && <div className="receipt-quality-origin">{note}</div>}
        </div>
    )
}

function MetricRow({ label, children }: { label?: ReactNode; children: ReactNode }) {
    return <div className={`receipt-metric-row ${label ? "receipt-metric-labeled" : ""}`}>{label && <div className="receipt-metric-label">{label}</div>}<div className="receipt-metric-content">{children}</div></div>
}

function DataColumn({ title, data, field = false }: { title: string; data: ColumnaDatos | null; field?: boolean }) {
    return (
        <section className={`receipt-data-column ${field ? "receipt-field-column" : "receipt-plant-column"}`} aria-label={title}>
            <h3>{title}</h3>
            <MetricRow label={field ? "A. PESO BRUTO" : undefined}>
                <Box value={data?.pesoBruto} caption="PESO BRUTO" />
            </MetricRow>
            <MetricRow label={field ? "B. TARA" : undefined}>
                <div className="receipt-equation receipt-tare-equation">
                    <Box value={data?.cantidadCanastas} caption="CANTIDAD DE CANASTAS" />
                    <Box value={data?.pesoPorCanasta} caption="X PESO POR CANASTAS" />
                    <span className="receipt-equals">=</span>
                    <Box value={data?.tara} caption="TARA" />
                </div>
            </MetricRow>
            <MetricRow label={field ? <>C. PESO MATERIA PRIMA{" "}<br />(A) - (B)</> : undefined}>
                <Box value={data?.pesoNeto} caption="PESO NETO" />
            </MetricRow>
            <MetricRow label={field ? <>D. PESO A PAGAR = %{" "}<br />DE CALIDAD</> : undefined}>
                <div className="receipt-equation receipt-quality-equation">
                    <Box value={data?.porcentajeCalidad} caption="%CC A PAGAR" note={field && data?.qualityDefinedInPlant ? "% definido en planta" : undefined} />
                    <span className="receipt-equals">=</span>
                    <Box value={data?.libras} caption={field ? "LIBRAS A PAGAR" : "LIBRAS VALIDADAS"} />
                </div>
            </MetricRow>
        </section>
    )
}

export function BoletaResumen({ boleta }: { boleta: RmReception }) {
    const receipt = buildReceiptModel(boleta)
    const style = { "--receipt-background": receiptTheme.background, "--receipt-ink": receiptTheme.ink } as CSSProperties
    return (
        <div>
            <div className="receipt-scroll" role="region" aria-label={`Recibo de materia prima ${receipt.number}`} tabIndex={0}>
                <article className="receipt-document" style={style}>
                    <header className="receipt-heading">
                        <div className="receipt-company">
                            <LegumexLogoStacked showTagline={false} className="legumex-logo-receipt" />
                            <div>{receiptCompany.name}<br />{receiptCompany.location}<br />{receiptCompany.phone}</div>
                        </div>
                        <div className="receipt-title"><h2>RECIBO DE MATERIA PRIMA</h2><p>{receipt.number}</p></div>
                        <div className="receipt-meta">
                            <p className="receipt-form-code">{receiptCompany.formCode}</p>
                            <LineField label="GRN No." value={receipt.grn} />
                            <LineField label="FECHA" value={receipt.date} />
                            <LineField label="C.D.P." value={receipt.cdp} />
                        </div>
                    </header>
                    <section className="receipt-general" aria-label="Datos generales">
                        <LineField label="TRANSP:" value={receipt.carrier} /><LineField label="PILOTO:" value={receipt.pilot} /><LineField label="FINCA:" value={receipt.finca} />
                        <LineField label="PRODUCTOR:" value={receipt.producer} /><LineField label="PLACA:" value={receipt.plate} /><LineField label="PRODUCTO:" value={receipt.product} />
                        <LineField label="INSPECT:" value={receipt.inspector} /><div /><div />
                        <div className="receipt-variety"><LineField label="VARIEDAD PRODUCTO:" value={receipt.variety} /></div>
                    </section>
                    <div className="receipt-data-grid">
                        <DataColumn title="DATOS CAMPO" data={receipt.field} field />
                        <DataColumn title="DATOS DE PLANTA" data={receipt.plant} />
                        <section className="receipt-data-column receipt-differences" aria-label="Diferencia">
                            <h3>DIFERENCIA</h3>
                            {[receipt.differences?.pesoBruto, receipt.differences?.tara, receipt.differences?.pesoNeto, receipt.differences?.libras].map((value, index) => (
                                <div className="receipt-difference-row" key={index}><div className="receipt-value">{number(value, true) || "\u00a0"}</div></div>
                            ))}
                            {receipt.differences && <CircleCheck className="receipt-complete-mark" size={17} aria-label="Datos de planta registrados" />}
                        </section>
                    </div>
                    {receipt.qualityNotice && <p className="receipt-quality-notice">{receipt.qualityNotice}</p>}
                    <section className="receipt-signatures" aria-label="Firmas">
                        {receipt.signatures.map(signature => (
                            <div className="receipt-signature" key={signature.label}>
                                <div className="receipt-signature-image">{signature.src && <img src={signature.src} alt={signature.label} />}</div>
                                <p>{signature.label}</p>
                                {signature.name && <span className="receipt-signature-name">{signature.name}</span>}
                            </div>
                        ))}
                    </section>
                </article>
            </div>
        </div>
    )
}
