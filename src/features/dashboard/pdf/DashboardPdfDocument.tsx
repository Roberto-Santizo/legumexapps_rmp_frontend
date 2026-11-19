import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import { LegumexLogoPdf } from "@/shared/component/LegumexLogoPdf"
import type { DashboardData } from "../schema/dashboard.schema"
import { buildDashboardCharts, dashboardKpis, dashboardNumber, dashboardCredit, dashboardChartType, dashboardPalette, dashboardColors } from "../model/dashboardPresentation"
import { DashboardGraphicPdf } from "./DashboardGraphicPdf"
import type { DashboardChart } from "../model/dashboardPresentation"
import { dashboardFilterLabels } from "../utils/dashboardFilters"
import { formatGuatemalaDate, formatGuatemalaDateTime } from "@/shared/utils/guatemalaDate"

const styles = StyleSheet.create({
    page: { padding: 28, paddingBottom: 48, fontFamily: "Helvetica", fontSize: 9, color: "#1e293b" },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 6 },
    description: { fontSize: 8, lineHeight: 1.5, marginBottom: 14, color: "#475569" },
    kpis: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
    kpi: { width: "23%", backgroundColor: "#f8fafc", padding: 8 },
    kpiLabel: { fontSize: 7, marginBottom: 6 }, kpiValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },
    legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
    chartRow: { flexDirection: "row", marginBottom: 9, alignItems: "center" },
    chartName: { width: "36%", paddingRight: 10, fontSize: 8 }, bars: { width: "64%" },
    barRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
    track: { flex: 1, height: 7, backgroundColor: "#f1f5f9" }, value: { width: 42, textAlign: "right", fontSize: 7 },
    table: { marginTop: 14, borderTopWidth: 0.5, borderLeftWidth: 0.5, borderColor: "#cbd5e1" },
    tableRow: { flexDirection: "row" }, cell: { padding: 5, fontSize: 7, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: "#cbd5e1" },
    footer: { position: "absolute", bottom: 18, left: 28, right: 28, textAlign: "center", fontSize: 6, color: "#64748b" },
})

function PdfChart({ chart }: { chart: DashboardChart }) {
    const max = chart.unit === "percent" ? 100 : Math.max(1, ...chart.rows.flatMap(row => row.values.map(value => value ?? 0)))
    const type = dashboardChartType(chart.id)
    const legend = type === "donut" ? chart.rows.map((row, index) => ({ name: row.name, color: dashboardPalette[index % dashboardPalette.length] })) : chart.series
    return <View>
        <View style={styles.legend}>{legend.map(series => <Text key={series.name} style={{ fontSize: 8, color: series.color }}>{series.name}</Text>)}</View>
        {!chart.rows.length && <Text style={styles.description}>No hay datos suficientes para este gráfico en el período seleccionado.</Text>}
        {!!chart.rows.length && type !== "bars" && <View wrap={false}><DashboardGraphicPdf chart={chart} /></View>}
        {type === "bars" && chart.rows.map((row, index) => <View key={index} style={styles.chartRow} wrap={false}>
            <Text style={styles.chartName}>{row.name}</Text><View style={styles.bars}>{row.values.map((value, series) => <View key={series} style={styles.barRow}>
                <View style={styles.track}><View style={{ width: `${(value ?? 0) / max * 100}%`, height: 7, backgroundColor: chart.series[series].color }} /></View>
                <Text style={styles.value}>{dashboardNumber(value)}{chart.unit === "percent" && value !== null ? " %" : ""}</Text>
            </View>)}</View>
        </View>)}
        <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: dashboardColors.ink, color: "white" }]} wrap={false}>{chart.table.headers.map((header, index) => <Text key={header} style={[styles.cell, { width: index === 0 ? "32%" : `${68 / (chart.table.headers.length - 1)}%`, fontFamily: "Helvetica-Bold" }]}>{header}</Text>)}</View>
            {chart.table.rows.map((row, index) => <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 ? "#f8fafc" : "white" }]} wrap={false}>{row.map((value, cell) => <Text key={cell} style={[styles.cell, { width: cell === 0 ? "32%" : `${68 / (row.length - 1)}%` }]}>{value}</Text>)}</View>)}
        </View>
    </View>
}

export function DashboardPdfDocument({ data }: { data: DashboardData }) {
    const charts = buildDashboardCharts(data)
    return <Document title="Dashboard de calidad y recepción de materia prima" author="Legumex">
        {charts.map((chart, index) => <Page key={chart.id} size="LETTER" style={styles.page}>
            <View style={styles.header}><LegumexLogoPdf /><Text style={{ fontSize: 8 }}>LEGUMEX RMP · REPORTE DE DASHBOARD</Text></View>
            <Text style={styles.title}>{index === 0 ? "Calidad y recepción de materia prima" : chart.title}</Text>
            <Text style={styles.description}>Boletas creadas del {formatGuatemalaDate(data.period.startDate)} al {formatGuatemalaDate(data.period.endDate)} · Guatemala{`\n`}Generado: {formatGuatemalaDateTime(data.generatedAt)}</Text>
            <Text style={styles.description}>{dashboardFilterLabels(data).join(" · ")}</Text>
            {index === 0 && <View>
                <View style={styles.kpis}>{dashboardKpis(data).map((kpi, index) => <View key={kpi.label} style={styles.kpi}><Text style={styles.kpiLabel}>{kpi.label}</Text><Text style={[styles.kpiValue, { color: dashboardPalette[index] }]}>{kpi.value}</Text></View>)}</View>
                <Text style={styles.description}>Aprobación = evaluaciones que alcanzan el porcentaje aceptado guardado / evaluaciones con ese parámetro. Calidad promedio = media por boleta evaluada. Sin evaluación no se cuenta como 0 %. Evaluaciones sin parámetro histórico: {data.summary.missingThreshold}. El ranking exige 3 evaluaciones comparables. Los datos reflejan el estado al generar este reporte.</Text>
                <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 12 }}>{chart.title}</Text>
            </View>}
            <Text style={styles.description}>{chart.description}</Text>
            <PdfChart chart={chart} />
            <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `${dashboardCredit}\nPágina ${pageNumber} de ${totalPages}`} />
        </Page>)}
    </Document>
}
