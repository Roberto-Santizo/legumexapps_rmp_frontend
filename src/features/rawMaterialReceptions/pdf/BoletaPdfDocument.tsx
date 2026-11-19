import type { ReactNode } from "react"
import { LegumexLogoPdf } from "@/shared/component/LegumexLogoPdf"
import { Document, Page, View, Text, Image, Svg, Path, Circle, StyleSheet } from "@react-pdf/renderer"
import type { RmReception } from "../schema/rmReception.schema"
import type { ColumnaDatos } from "./boletaDatos.util"
import { buildReceiptModel, formatReceiptNumber as number, receiptCompany, receiptTheme } from "./boletaDocumento.model"

const styles = StyleSheet.create({
    page: { backgroundColor: "#ffffff", padding: 10, fontFamily: "Helvetica", fontSize: 7, color: receiptTheme.ink },
    paper: { backgroundColor: receiptTheme.background, borderWidth: 0.5, borderColor: "#cccccc", padding: 8, minHeight: 355 },
    header: { flexDirection: "row", minHeight: 40 },
    company: { width: "34%", flexDirection: "row", alignItems: "center", gap: 7 },
    companyText: { fontSize: 6.1, lineHeight: 1.4 },
    titleBlock: { width: "41%", alignItems: "center", paddingTop: 3 },
    title: { fontFamily: "Helvetica-Bold", fontSize: 11.5, textAlign: "center" },
    number: { fontFamily: "Helvetica-Bold", fontSize: 11.5, color: receiptTheme.documentNumber, marginTop: 4 },
    meta: { width: "25%", paddingLeft: 10 },
    formCode: { fontSize: 6.5, textAlign: "right", marginBottom: 3 },
    metaLine: { flexDirection: "row", marginTop: 3, alignItems: "flex-end", gap: 3 },
    metaLabel: { width: 34, fontSize: 6.5 },
    metaValue: { flex: 1, borderBottomWidth: 0.6, borderBottomColor: receiptTheme.border, fontSize: 6.5, textAlign: "right", minHeight: 9 },
    general: { marginTop: 6, marginBottom: 6 },
    generalRow: { flexDirection: "row", gap: 10, marginBottom: 5 },
    generalCell: { width: "39%" },
    generalLast: { flex: 1 },
    inline: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
    inlineLabel: { fontSize: 6.5 },
    inlineValue: { flex: 1, fontSize: 6.5, minHeight: 10, borderBottomWidth: 0.6, borderBottomColor: receiptTheme.border },
    dataGrid: { flexDirection: "row", gap: 10 },
    fieldColumn: { width: "49%" },
    plantColumn: { width: "32%" },
    differenceColumn: { flex: 1 },
    dataColumn: { borderWidth: 0.6, borderColor: receiptTheme.border, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 12, minHeight: 150 },
    columnTitle: { height: 20, fontSize: 8.2, fontFamily: "Helvetica-Bold", textAlign: "center" },
    metric: { flexDirection: "row", alignItems: "center", height: 27 },
    metricLabel: { width: "37%", paddingRight: 3, fontSize: 6.5, lineHeight: 1.5 },
    metricContent: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
    boxGroup: { width: 71 },
    valueBox: { borderWidth: 0.6, borderColor: receiptTheme.border, minHeight: 16, paddingVertical: 3, paddingHorizontal: 1, textAlign: "center", fontSize: 7 },
    caption: { marginTop: 2, fontSize: 4.9, textAlign: "center", lineHeight: 1.1 },
    equation: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 4 },
    equals: { width: 6, textAlign: "center", paddingTop: 4, fontSize: 7 },
    differenceRow: { height: 27, justifyContent: "center", paddingBottom: 5 },
    completion: { position: "absolute", bottom: 6, left: "43%" },
    signatures: { marginTop: 8 },
    signatureRow: { flexDirection: "row", gap: 34, marginBottom: 4 },
    signature: { flex: 1, alignItems: "center" },
    signatureImageArea: { height: 19, width: "100%", alignItems: "center", justifyContent: "flex-end" },
    signatureImage: { width: "95%", height: 18, objectFit: "contain" },
    signatureLabel: { width: "100%", borderTopWidth: 0.6, borderTopColor: receiptTheme.border, textAlign: "center", paddingTop: 3, fontSize: 6.5 },
    signatureName: { width: "100%", marginTop: 2, fontSize: 6.5, fontFamily: "Helvetica-Bold", textAlign: "center" },
})

function Inline({ label, value }: { label: string; value: string }) {
    return <View style={styles.inline}><Text style={styles.inlineLabel}>{label}</Text><Text style={styles.inlineValue}>{value || " "}</Text></View>
}

function Meta({ label, value }: { label: string; value: string }) {
    return <View style={styles.metaLine}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value || " "}</Text></View>
}

function Box({ value, caption, grow }: { value: number | null | undefined; caption: string; grow?: number }) {
    return (
        <View style={grow ? { flexGrow: grow, flexBasis: 0 } : styles.boxGroup}>
            <Text style={styles.valueBox}>{number(value) || " "}</Text>
            <Text style={styles.caption}>{caption}</Text>
        </View>
    )
}

function Metric({ label, children }: { label?: string; children: ReactNode }) {
    return (
        <View style={styles.metric}>
            {label && <Text style={styles.metricLabel}>{label}</Text>}
            <View style={styles.metricContent}>{children}</View>
        </View>
    )
}

function DataColumn({ data, field = false }: { data: ColumnaDatos | null; field?: boolean }) {
    return (
        <View style={[styles.dataColumn, field ? styles.fieldColumn : styles.plantColumn]}>
            <Text style={styles.columnTitle}>{field ? "DATOS CAMPO" : "DATOS DE PLANTA"}</Text>
            <Metric label={field ? "A. PESO BRUTO" : undefined}><Box value={data?.pesoBruto} caption="PESO BRUTO" /></Metric>
            <Metric label={field ? "B. TARA" : undefined}>
                <View style={styles.equation}>
                    <Box value={data?.cantidadCanastas} caption={"CANTIDAD DE\nCANASTAS"} grow={1} />
                    <Box value={data?.pesoPorCanasta} caption={"X PESO POR\nCANASTAS"} grow={1} />
                    <Text style={styles.equals}>=</Text>
                    <Box value={data?.tara} caption="TARA" grow={1} />
                </View>
            </Metric>
            <Metric label={field ? "C. PESO MATERIA PRIMA\n(A) - (B)" : undefined}><Box value={data?.pesoNeto} caption="PESO NETO" /></Metric>
            <Metric label={field ? "D. PESO A PAGAR = %\nDE CALIDAD" : undefined}>
                <View style={styles.equation}>
                    <Box value={data?.porcentajeCalidad} caption={field && data?.qualityDefinedInPlant ? "%CC A PAGAR\n% definido en planta" : "%CC A PAGAR"} grow={1} />
                    <Text style={styles.equals}>=</Text>
                    <Box value={data?.libras} caption={field ? "LIBRAS A PAGAR" : "LIBRAS VALIDADAS"} grow={1.4} />
                </View>
            </Metric>
        </View>
    )
}

function Signature({ label, src, name }: { label: string; src?: string | null; name?: string }) {
    return (
        <View style={styles.signature}>
            <View style={styles.signatureImageArea}>{src && <Image style={styles.signatureImage} src={src} />}</View>
            <Text style={styles.signatureLabel}>{label}</Text>
            {name && <Text style={styles.signatureName}>{name}</Text>}
        </View>
    )
}

export function BoletaPdfDocument({ boleta }: { boleta: RmReception }) {
    const receipt = buildReceiptModel(boleta)
    return (
        <Document title={`${receipt.number} - Recibo de materia prima`}>
            <Page size={[612, 396]} style={styles.page}>
                <View style={styles.paper} wrap={false}>
                    <View style={styles.header}>
                        <View style={styles.company}>
                            <LegumexLogoPdf />
                            <View><Text style={styles.companyText}>{receiptCompany.name}</Text><Text style={styles.companyText}>{receiptCompany.location}</Text><Text style={styles.companyText}>{receiptCompany.phone}</Text></View>
                        </View>
                        <View style={styles.titleBlock}><Text style={styles.title}>RECIBO DE MATERIA PRIMA</Text><Text style={styles.number}>{receipt.number}</Text></View>
                        <View style={styles.meta}><Text style={styles.formCode}>{receiptCompany.formCode}</Text><Meta label="GRN No." value={receipt.grn} /><Meta label="FECHA" value={receipt.date} /><Meta label="C.D.P." value={receipt.cdp} /></View>
                    </View>
                    <View style={styles.general}>
                        <View style={styles.generalRow}><View style={styles.generalCell}><Inline label="TRANSP:" value={receipt.carrier} /></View><View style={styles.generalCell}><Inline label="PILOTO:" value={receipt.pilot} /></View><View style={styles.generalLast}><Inline label="FINCA:" value={receipt.finca} /></View></View>
                        <View style={styles.generalRow}><View style={styles.generalCell}><Inline label="PRODUCTOR:" value={receipt.producer} /></View><View style={styles.generalCell}><Inline label="PLACA:" value={receipt.plate} /></View><View style={styles.generalLast}><Inline label="PRODUCTO:" value={receipt.product} /></View></View>
                        <View style={styles.generalRow}><View style={styles.generalCell}><Inline label="INSPECT:" value={receipt.inspector} /></View></View>
                        <Inline label="VARIEDAD PRODUCTO:" value={receipt.variety} />
                    </View>
                    <View style={styles.dataGrid}>
                        <DataColumn data={receipt.field} field /><DataColumn data={receipt.plant} />
                        <View style={[styles.dataColumn, styles.differenceColumn]}>
                            <Text style={styles.columnTitle}>DIFERENCIA</Text>
                            {[receipt.differences?.pesoBruto, receipt.differences?.tara, receipt.differences?.pesoNeto, receipt.differences?.libras].map((value, index) => <View key={index} style={styles.differenceRow}><Text style={styles.valueBox}>{number(value, true) || " "}</Text></View>)}
                            {receipt.differences && <Svg width={11} height={11} viewBox="0 0 24 24" style={styles.completion}><Circle cx="12" cy="12" r="9" fill="none" stroke="#00c653" strokeWidth={1.5} /><Path d="M8 12l3 3 7-8" fill="none" stroke="#00c653" strokeWidth={1.5} /></Svg>}
                        </View>
                    </View>
                    <View style={styles.signatures}>
                        <View style={styles.signatureRow}>{receipt.signatures.slice(0, 3).map(signature => <Signature key={signature.label} {...signature} />)}</View>
                        {receipt.signatures.length > 3 && <View style={styles.signatureRow}>{receipt.signatures.slice(3).map(signature => <Signature key={signature.label} {...signature} />)}<View style={styles.signature} /></View>}
                    </View>
                </View>
            </Page>
        </Document>
    )
}
