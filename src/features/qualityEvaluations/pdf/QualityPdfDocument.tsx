import { formatDecimal } from "@/shared/utils/formatDecimal"
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { LegumexLogoPdf } from "@/shared/component/LegumexLogoPdf"
import type { QualityDocumentModel } from "./qualityDocument.model"
import { qualityDocumentCode, qualityDocumentFooter } from "./qualityDocument.model"
import { pestResultLabels } from "../schema/pestEvaluation.schema"
import { formatPestBasketRange } from "../utils/pestEvaluation"

const styles = StyleSheet.create({
    page: { paddingTop: 26, paddingHorizontal: 22, paddingBottom: 38, fontFamily: "Helvetica", fontSize: 8, color: "#111111" },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    logo: { width: "24%" }, title: { width: "48%", textAlign: "center", lineHeight: 1.5 },
    bold: { fontFamily: "Helvetica-Bold" }, number: { fontSize: 12, color: "#e11d48", fontFamily: "Helvetica-Bold" },
    meta: { width: "28%", textAlign: "right", fontSize: 7, lineHeight: 1.5 },
    reference: { fontSize: 7, marginBottom: 12 }, date: { fontSize: 7, marginBottom: 18 },
    info: { borderTopWidth: 0.6, borderLeftWidth: 0.6, marginBottom: 22 },
    row: { flexDirection: "row" }, infoCell: { width: "50%", borderRightWidth: 0.6, borderBottomWidth: 0.6, padding: 5, fontSize: 7 },
    table: { borderTopWidth: 0.6, borderLeftWidth: 0.6 },
    cell: { borderRightWidth: 0.6, borderBottomWidth: 0.6, paddingVertical: 5, paddingHorizontal: 4, textAlign: "center", fontSize: 7 },
    totals: { marginLeft: "40%", borderLeftWidth: 0.6 }, totalLabel: { width: "63.333%", textAlign: "right" }, totalValue: { width: "36.667%", textAlign: "left" },
    observationsTitle: { marginTop: 22, marginBottom: 5, fontFamily: "Helvetica-Bold", fontSize: 7 },
    observations: { borderWidth: 0.6, minHeight: 46, padding: 6, lineHeight: 1.5, fontSize: 8 },
    signature: { marginTop: 28, width: "52%", alignSelf: "center", alignItems: "center" },
    signatureImage: { height: 42, width: "95%", objectFit: "contain" }, signatureLine: { width: "100%", borderTopWidth: 0.6, textAlign: "center", paddingTop: 6, fontSize: 7 },
    footer: { position: "absolute", bottom: 18, left: 22, right: 22, textAlign: "center", fontSize: 6, color: "#475569" },
})

export function QualityPdfDocument({ model }: { model: QualityDocumentModel }) {
    return <Document title={`Evaluación de calidad ${model.number}`} author="Legumex">
        <Page size="LETTER" style={styles.page}>
            <View style={styles.header}>
                <View style={styles.logo}><LegumexLogoPdf /></View>
                <View style={styles.title}><Text style={styles.bold}>FORMATO</Text><Text style={styles.number}>{model.number}</Text><Text>RECEPCIÓN MATERIA PRIMA</Text></View>
                <View style={styles.meta}><Text>CÓDIGO: {qualityDocumentCode}</Text><Text>VERSIÓN: 01</Text><Text render={({ pageNumber, totalPages }) => `PÁGINA ${pageNumber} DE ${totalPages}`} /></View>
            </View>
            <Text style={styles.reference}>REFERENCIA BOLETA DE RECEPCIÓN: {model.reference}</Text>
            <Text style={styles.date}>FECHA: {model.date}</Text>
            <View style={styles.info}>{model.info.map(([label, value, secondLabel, secondValue], index) => <View key={index} style={styles.row} wrap={false}>
                <Text style={styles.infoCell}><Text style={styles.bold}>{label}: </Text>{value || " "}</Text>
                <Text style={styles.infoCell}><Text style={styles.bold}>{secondLabel}: </Text>{secondValue || " "}</Text>
            </View>)}</View>
            <View style={styles.table}>
                <View style={styles.row} wrap={false}>{["PUNTOS A VERIFICAR", "PORCENTAJE", "TOLERANCIA", "RESULTADO"].map((label, index) => <Text key={label} style={[styles.cell, styles.bold, { width: ["17%", "23%", "38%", "22%"][index] }]}>{label}</Text>)}</View>
                {model.defects.map(defect => <View key={defect.id} style={styles.row} wrap={false}>
                    <Text style={[styles.cell, { width: "17%" }]}>{defect.defectName ?? "Defecto registrado"}</Text>
                    <Text style={[styles.cell, { width: "23%" }]}>{formatDecimal(defect.input)} %</Text>
                    <Text style={[styles.cell, { width: "38%" }]}>{formatDecimal(defect.tolerancePercentage)} %</Text>
                    <Text style={[styles.cell, { width: "22%" }]}>{formatDecimal(defect.result)}</Text>
                </View>)}
            </View>
            <View style={styles.totals} wrap={false}>{[["TOTAL DE % DEFECTOS", model.total], ["% CALIDAD", model.percentage]].map(([label, value]) => <View key={label} style={styles.row}>
                <Text style={[styles.cell, styles.totalLabel, styles.bold]}>{label}</Text><Text style={[styles.cell, styles.totalValue]}>{formatDecimal(Number(value))}</Text>
            </View>)}</View>
            {model.pestEvaluation && <View wrap={false}>
                <Text style={styles.observationsTitle}>GUSANOS Y ÁFIDOS: {pestResultLabels[model.pestEvaluation.result]}</Text>
                <View style={styles.observations}>
                    <Text>Muestra revisada: {model.pestEvaluation.rule.samplePounds} lb. Rango: {formatPestBasketRange(model.pestEvaluation.rule)} canastas.</Text>
                    <Text>Gusanos encontrados: {model.pestEvaluation.wormCount}. Cabezas con áfidos: {model.pestEvaluation.aphidHeadsCount}.</Text>
                    <Text>Fuera de tolerancia desde {model.pestEvaluation.rule.wormRejectionCount} gusanos o {model.pestEvaluation.rule.aphidRejectionCount} cabezas con áfidos.</Text>
                    {model.pestEvaluation.result === "correction_required" && <Text>Presencia dentro del límite de corrección.</Text>}
                </View>
            </View>}
            {!!model.qualityReasons?.length && <View wrap={false}><Text style={styles.observationsTitle}>MOTIVOS DE CONSIGNACIÓN:</Text><View style={styles.observations}>{model.qualityReasons.map(reason => <Text key={reason}>{reason}</Text>)}</View></View>}
            <Text style={styles.observationsTitle}>OBSERVACIONES:</Text>
            <View style={styles.observations}><Text>{model.observations || " "}</Text></View>
            <View style={styles.signature} wrap={false}>
                {model.signature ? <Image src={model.signature} style={styles.signatureImage} /> : <View style={{ height: 42 }} />}
                <Text style={styles.signatureLine}>{model.evaluator || "NOMBRE INSPECTOR PLANTA"}</Text>
                <Text style={{ fontSize: 6, marginTop: 4 }}>INSPECTOR DE CALIDAD</Text>
            </View>
            <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `${qualityDocumentCode} · ${qualityDocumentFooter} · Página ${pageNumber} de ${totalPages}`} />
        </Page>
    </Document>
}
