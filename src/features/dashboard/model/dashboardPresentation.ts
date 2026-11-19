import type { DashboardData } from "../schema/dashboard.schema"
import { dashboardText, dashboardIntlLocale } from "../i18n/dashboardCopy"
import type { DashboardLocale } from "../i18n/dashboardCopy"
export type DashboardChart = {
    id: string; title: string; description: string; unit: "percent" | "count"
    series: { name: string; color: string }[]
    rows: { name: string; values: (number | null)[] }[]
    table: { headers: string[]; rows: string[][] }
}
export const dashboardNumber = (value: number | null, locale: DashboardLocale = "es") => value === null ? "—" : value.toLocaleString(dashboardIntlLocale(locale), { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })
export const dashboardCredit = "Reporte de Recepción de Materia Prima · Desarrollado por Luis · © Legumex. Derechos reservados."
export const dashboardColors = { quality: "#16758a", approval: "#4aa58b", intake: "#2396ab", exception: "#f28c28", yellow: "#f3c64e", ink: "#123e4d" }
export const dashboardPalette = [dashboardColors.quality, dashboardColors.exception, dashboardColors.yellow, dashboardColors.approval, dashboardColors.intake, "#82bba1", "#d9ad36", "#125464"]
export const dashboardCombinedPalette = [dashboardColors.intake, dashboardColors.approval, dashboardColors.yellow, dashboardColors.exception]
export function dashboardChartType(id: string) { return id === "intake" ? "donut" : id === "trend" ? "line" : id === "products" ? "columns" : id === "defects" ? "combined" : "bars" }
export function dashboardKpis(data: DashboardData, locale: DashboardLocale = "es") {
    const s = data.summary
    return [
        { label: "Boletas creadas", value: dashboardNumber(s.receipts) },
        { label: "Boletas evaluadas", value: dashboardNumber(s.evaluations) },
        { label: "Calidad promedio", value: s.averageQuality === null ? "—" : `${dashboardNumber(s.averageQuality)} %` },
        { label: "Tasa de aprobación", value: s.approvalRate === null ? "—" : `${dashboardNumber(s.approvalRate)} %` },
        { label: "Pendientes de calidad", value: dashboardNumber(s.pendingQuality) },
        { label: "Evaluaciones aprobadas", value: dashboardNumber(s.approved) },
        { label: "Peso neto evaluado (lb)", value: dashboardNumber(s.netWeight) },
        { label: "Libras pagables evaluadas", value: dashboardNumber(s.payablePounds) },
    ].map(kpi => ({ ...kpi, label: dashboardText(locale, kpi.label) }))
}
export function buildDashboardCharts(data: DashboardData, locale: DashboardLocale = "es"): DashboardChart[] {
    const qualitySeries = [{ name: "Calidad promedio", color: dashboardColors.quality }, { name: "Aprobación", color: dashboardColors.approval }]
    const groupHeaders = ["Producto / variedad", "Evaluadas", "Comparables", "Aprobadas", "Calidad (%)", "Aprobación (%)"]
    const groupRow = (row: DashboardData["products"][number]) => [row.name, String(row.evaluations), String(row.comparable), String(row.approved), dashboardNumber(row.averageQuality), dashboardNumber(row.approvalRate)]
    const qualityOrder = (direction: 1 | -1) => (a: DashboardData["producers"][number], b: DashboardData["producers"][number]) => {
        if (a.averageQuality === null || b.averageQuality === null) return a.averageQuality === b.averageQuality ? a.id - b.id : a.averageQuality === null ? 1 : -1
        return direction * (a.averageQuality - b.averageQuality)
            || direction * ((a.approvalRate ?? 0) - (b.approvalRate ?? 0))
            || b.comparable - a.comparable || a.name.localeCompare(b.name) || a.id - b.id
    }
    const highQuality = [...data.reliableProducers].filter(row => row.averageQuality !== null).sort(qualityOrder(-1))
    const lowQuality = [...data.reliableProducers].filter(row => row.averageQuality !== null).sort(qualityOrder(1))
    const producerHeaders = ["Productor / proveedor", "Evaluadas", "Comparables", "Aprobadas", "Calidad (%)", "Aprobación (%)", "Muestra para ranking"]
    const producerTable = (direction: 1 | -1) => ({ headers: producerHeaders, rows: [...data.producers].sort(qualityOrder(direction)).map(row => [...groupRow(row), row.comparable >= 3 && row.id !== 0 ? "Suficiente" : "Menos de 3 comparables"]) })
    const charts: DashboardChart[] = [
        { id: "intake", title: "Los 5 productos con más ingresos", description: "Productos y variedades con más boletas creadas en el período, incluyendo las pendientes de recepción o calidad. La dona representa solo los 5 primeros; la tabla muestra todos.", unit: "count",
            series: [{ name: "Boletas ingresadas", color: dashboardColors.intake }], rows: data.intakeProducts.slice(0, 5).map(row => ({ name: row.name, values: [row.receipts] })),
            table: { headers: ["Producto / variedad", "Boletas ingresadas"], rows: data.intakeProducts.map(row => [row.name, String(row.receipts)]) } },
        { id: "trend", title: "Evolución mensual de calidad y aprobación", description: "Agrupada por mes de creación de la boleta. El gráfico muestra los últimos 12 meses con evaluaciones.", unit: "percent", series: [qualitySeries[0], { ...qualitySeries[1], color: dashboardColors.exception }],
            rows: data.trend.slice(-12).map(row => ({ name: row.month, values: [row.averageQuality, row.approvalRate] })),
            table: { headers: ["Mes", ...groupHeaders.slice(1)], rows: data.trend.map(row => [row.month, ...groupRow(row).slice(1)]) } },
        { id: "products", title: "Calidad y aprobación por producto y variedad", description: "Comparación de los 10 productos con más evaluaciones. La tabla incluye todos los productos.", unit: "percent", series: [qualitySeries[0], { ...qualitySeries[1], color: dashboardColors.yellow }],
            rows: data.products.slice(0, 10).map(row => ({ name: row.name, values: [row.averageQuality, row.approvalRate] })),
            table: { headers: groupHeaders, rows: data.products.map(groupRow) } },
        { id: "defects", title: "Defectos más recurrentes en materia prima", description: "Los 10 defectos presentes en más boletas. Observado: porcentaje mayor a cero. Fuera de tolerancia: resultado descontable mayor a cero.", unit: "count",
            series: [{ name: "Boletas con el defecto", color: dashboardColors.yellow }, { name: "Boletas fuera de tolerancia", color: dashboardColors.exception }],
            rows: data.defects.slice(0, 10).map(row => ({ name: row.name, values: [row.observedLots, row.penalizedLots] })),
            table: { headers: ["Defecto", "Observado en boletas", "Fuera de tolerancia", "Descuento promedio (puntos)"], rows: data.defects.map(row => [row.name, String(row.observedLots), String(row.penalizedLots), dashboardNumber(row.averagePenalty)]) } },
        { id: "producers", title: "Productores con mayor calidad promedio", description: "Los 10 productores con mayor calidad promedio en las fechas y filtros aplicados. Se requieren al menos 3 evaluaciones comparables por productor. La tabla incluye aprobación y tamaño de muestra de todos los productores evaluados.", unit: "percent",
            series: [{ name: "Calidad promedio", color: dashboardColors.approval }], rows: highQuality.slice(0, 10).map(row => ({ name: row.name, values: [row.averageQuality] })),
            table: producerTable(-1) },
        { id: "consignments", title: "Boletas en consignación por producto", description: "Boletas marcadas en consignación, agrupadas por producto y variedad, según su fecha de creación en el período seleccionado. Se muestra el estado guardado actualmente. El gráfico presenta los 10 primeros; la tabla incluye todos.", unit: "count",
            series: [{ name: "Boletas en consignación", color: "#dc2626" }],
            rows: data.consignedProducts.slice(0, 10).map(row => ({ name: row.name, values: [row.receipts] })),
            table: { headers: ["Producto / variedad", "Boletas en consignación"], rows: data.consignedProducts.map(row => [row.name, String(row.receipts)]) } },
        { id: "producers-low", title: "Productores con menor calidad promedio", description: "Los 10 productores con menor calidad promedio en las fechas y filtros aplicados. Se requieren al menos 3 evaluaciones comparables por productor. Un resultado menor es relativo a esta selección; no implica un rechazo automático.", unit: "percent",
            series: [{ name: "Calidad promedio", color: dashboardColors.exception }], rows: lowQuality.slice(0, 10).map(row => ({ name: row.name, values: [row.averageQuality] })),
            table: producerTable(1) },
    ]
    if (locale === "es") return charts
    const t = (text: string) => dashboardText(locale, text)
    return charts.map(chart => ({ ...chart, title: t(chart.title), description: t(chart.description), series: chart.series.map(series => ({ ...series, name: t(series.name) })),
        table: { headers: chart.table.headers.map(t), rows: chart.table.rows.map(row => row.map((cell, index) => index === 0 ? cell : t(cell))) } }))
}
