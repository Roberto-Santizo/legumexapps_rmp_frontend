import { formatDecimal } from "@/shared/utils/formatDecimal"
import { LegumexLogoStacked } from "@/shared/component/LegumexLogoStacked"
import type { QualityDocumentModel } from "./qualityDocument.model"
import { qualityDocumentCode, qualityDocumentFooter } from "./qualityDocument.model"
import "../styles/qualityDocument.css"
import { pestResultLabels } from "../schema/pestEvaluation.schema"
import { formatPestBasketRange } from "../utils/pestEvaluation"

export function QualityDocumentPreview({ model }: { model: QualityDocumentModel }) {
    return <article className="quality-document" aria-label={`Evaluación de calidad ${model.number}`}>
        <header className="quality-document-header">
            <LegumexLogoStacked showTagline={false} />
            <div className="quality-document-title"><strong>FORMATO</strong><h3>{model.number}</h3><p>RECEPCIÓN MATERIA PRIMA</p></div>
            <div className="quality-document-meta"><p>CÓDIGO: {qualityDocumentCode}</p><p>VERSIÓN: 01</p></div>
        </header>
        <p className="quality-document-reference"><strong>REFERENCIA BOLETA DE RECEPCIÓN:</strong> {model.reference}</p>
        <p className="quality-document-date"><strong>FECHA:</strong> {model.date}</p>
        <div className="quality-document-info">{model.info.map(([label, value, secondLabel, secondValue], index) => <div key={index}>
            <p><strong>{label}: </strong>{value || "—"}</p><p><strong>{secondLabel}: </strong>{secondValue || "—"}</p>
        </div>)}</div>
        <div className="quality-document-table-scroll" tabIndex={0} role="region" aria-label="Resultados de la evaluación de calidad">
            <table className="quality-document-table">
                <colgroup><col style={{ width: "17%" }} /><col style={{ width: "23%" }} /><col style={{ width: "38%" }} /><col style={{ width: "22%" }} /></colgroup>
                <thead><tr>{["PUNTOS A VERIFICAR", "PORCENTAJE", "TOLERANCIA", "RESULTADO"].map(label => <th key={label}>{label}</th>)}</tr></thead>
                <tbody>{model.defects.map(defect => <tr key={defect.id}>
                    <td>{defect.defectName ?? "Defecto registrado"}</td><td>{formatDecimal(defect.input)} %</td><td>{formatDecimal(defect.tolerancePercentage)} %</td><td>{formatDecimal(defect.result)}</td>
                </tr>)}</tbody>
                <tfoot><tr><td colSpan={2} className="quality-document-empty" /><th>TOTAL DE % DEFECTOS</th><td>{formatDecimal(model.total)}</td></tr>
                    <tr><td colSpan={2} className="quality-document-empty" /><th>% CALIDAD</th><td>{formatDecimal(model.percentage)}</td></tr></tfoot>
            </table>
        </div>
        {model.pestEvaluation && <section className="quality-document-observations">
            <h4>GUSANOS Y ÁFIDOS — {pestResultLabels[model.pestEvaluation.result]}</h4>
            <p>Muestra revisada: {model.pestEvaluation.rule.samplePounds} lb · Canastas: {formatPestBasketRange(model.pestEvaluation.rule)}.</p>
            <p>Gusanos encontrados: {model.pestEvaluation.wormCount}. Cabezas con áfidos: {model.pestEvaluation.aphidHeadsCount}.</p>
            <p>Fuera de tolerancia desde {model.pestEvaluation.rule.wormRejectionCount} gusanos o {model.pestEvaluation.rule.aphidRejectionCount} cabezas con áfidos.</p>
            {model.pestEvaluation.result === "correction_required" && <p>Presencia dentro del límite de corrección.</p>}
        </section>}
        {!!model.qualityReasons?.length && <section className="quality-document-observations"><h4>MOTIVOS DE CONSIGNACIÓN:</h4>{model.qualityReasons.map(reason => <p key={reason}>{reason}</p>)}</section>}
        <section className="quality-document-observations"><h4>OBSERVACIONES:</h4><p>{model.observations || "\u00a0"}</p></section>
        <div className="quality-document-signature">
            {model.signature && <img src={model.signature} alt="Firma del evaluador de calidad" />}
            <p>{model.evaluator || "NOMBRE INSPECTOR PLANTA"}</p><small>INSPECTOR DE CALIDAD</small>
        </div>
        <footer>{qualityDocumentCode} · {qualityDocumentFooter}</footer>
    </article>
}
