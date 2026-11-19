import { useState } from "react"
import { ComposedChart, Bar, BarChart, CartesianGrid, Cell, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/shared/component/table.component"
import type { DashboardChart as Chart } from "../model/dashboardPresentation"
import { dashboardNumber, dashboardPalette, dashboardCombinedPalette, dashboardChartType } from "../model/dashboardPresentation"
import { dashboardText } from "../i18n/dashboardCopy"
import type { DashboardLocale } from "../i18n/dashboardCopy"
import "../styles/dashboardCharts.css"

type TipProps = { active?: boolean; payload?: readonly { name?: string | number; value?: unknown; color?: string; payload?: { name?: string } }[]; label?: unknown; percent: boolean; locale: DashboardLocale }
function ChartTooltip({ active, payload, label, percent, locale }: TipProps) {
    if (!active || !payload?.length) return null
    return <div className="dashboard-chart-tooltip"><strong>{String(payload[0]?.payload?.name ?? label ?? "")}</strong>{payload.map((item, index) => <p key={index}>
        <span className="dashboard-series-dot" style={{ backgroundColor: item.color ?? dashboardPalette[index] }} /><span>{item.name}</span>
        <b>{typeof item.value === "number" ? dashboardNumber(item.value, locale) : "—"}{percent && typeof item.value === "number" ? " %" : ""}</b>
    </p>)}</div>
}
const short = (value: string, limit = 20) => value.length > limit ? `${value.slice(0, limit - 1)}…` : value
const tick = { fill: "#64748b", fontSize: 11 }

export function DashboardChart({ chart, locale = "es" }: { chart: Chart; locale?: DashboardLocale }) {
    const t = (text: string) => dashboardText(locale, text)
    const [circularType, setCircularType] = useState<"donut" | "pie">("donut")
    const type = dashboardChartType(chart.id) === "donut" ? circularType : dashboardChartType(chart.id)
    const circular = type === "donut" || type === "pie"
    const data = chart.rows.map(row => ({ name: row.name, ...Object.fromEntries(row.values.map((value, index) => [`value${index}`, value])) }))
    const total = chart.rows.reduce((sum, row) => sum + (row.values[0] ?? 0), 0)
    const tooltip = <Tooltip content={<ChartTooltip percent={chart.unit === "percent"} locale={locale} />} cursor={circular ? false : { stroke: "#cbd5e1", fill: "#f1f5f9", fillOpacity: 0.65 }} />
    const domain: [number, number | "auto"] = [0, chart.unit === "percent" ? 100 : "auto"]
    const axisFormat = (value: number) => `${dashboardNumber(value, locale)}${chart.unit === "percent" ? "%" : ""}`
    const height = circular ? 245 : type === "bars" ? Math.max(250, chart.rows.length * (chart.series.length > 1 ? 54 : 36) + 30) : 285
    return <section className={`dashboard-chart-card dashboard-chart-${chart.id}`} aria-labelledby={`chart-${chart.id}`}>
        <div className="dashboard-chart-heading"><div><span className="dashboard-eyebrow">{t(circular ? "Distribución" : type === "line" ? "Tendencia" : "Comparativo")}</span>
            <h3 id={`chart-${chart.id}`}>{chart.title}</h3></div><span className="dashboard-chart-unit">{t(chart.unit === "percent" ? "Porcentaje" : "Boletas")}</span>
        </div>
        {circular && <div className="dashboard-chart-switch" role="group" aria-label={locale === "es" ? "Tipo de gr?fico" : "Chart type"}>{(["pie", "donut"] as const).map(option => <button key={option} type="button" aria-pressed={type === option} onClick={() => setCircularType(option)}>{option === "pie" ? (locale === "es" ? "Pastel" : "Pie") : (locale === "es" ? "Rosca" : "Donut")}</button>)}</div>}
        <p className="dashboard-chart-description">{chart.description}</p>
        {!chart.rows.length ? <div className="dashboard-chart-empty"><span aria-hidden="true">—</span><h4>{t(chart.id === "consignments" ? "Sin boletas en consignación" : "No hay datos suficientes")}</h4>
            <p>{t(chart.id === "consignments" ? "No se registran boletas en consignación en el período seleccionado." : chart.id.startsWith("producers") ? "Se requieren al menos 3 evaluaciones comparables por productor dentro de las fechas y filtros aplicados. Revisa también la tabla completa." : "Este gráfico necesita registros del período seleccionado. Los valores pendientes no se representan como cero.")}</p>
        </div> : <div className={circular ? "dashboard-donut-layout" : undefined}>
            <div className="dashboard-chart-canvas" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: circular ? 260 : 560, height }}>
                    {circular ? <PieChart accessibilityLayer aria-label={chart.title}>
                        <Pie isAnimationActive={false} data={data} dataKey="value0" nameKey="name" cx="50%" cy="50%" innerRadius={type === "donut" ? "68%" : 0} outerRadius="86%" paddingAngle={data.length > 1 ? 2 : 0} cornerRadius={2} stroke="none">
                            {data.map((_, index) => <Cell key={index} fill={dashboardPalette[index % dashboardPalette.length]} />)}
                        </Pie>
                        {type === "donut" && <><text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize={30} fontWeight={600}>{dashboardNumber(total, locale)}</text>
                        <text x="50%" y="59%" textAnchor="middle" fill="#64748b" fontSize={10}>{t("BOLETAS · TOP 5")}</text></>}{tooltip}
                    </PieChart> : type !== "bars" ? <ComposedChart data={data} margin={{ top: 16, right: 12, bottom: 32, left: 0 }} accessibilityLayer aria-label={chart.title}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" vertical={false} />
                        <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} tickFormatter={value => short(String(value), 14)} minTickGap={12} dy={8} />
                        <YAxis domain={domain} tick={tick} axisLine={false} tickLine={false} tickFormatter={axisFormat} width={55} />{tooltip}
                        {chart.series.map((series, index) => (type === "line" || (type === "combined" && index === 1)) ? <Line key={series.name} isAnimationActive={false} type="linear" dataKey={`value${index}`} name={series.name} stroke={series.color} strokeWidth={2.5} dot={{ r: type === "line" ? 4 : 3, fill: series.color, stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6 }} strokeDasharray={type === "line" && index === 1 ? "6 4" : undefined} connectNulls={false} /> : <Bar key={series.name} isAnimationActive={false} dataKey={`value${index}`} name={series.name} fill={series.color} radius={[3, 3, 0, 0]} maxBarSize={28}>{type === "combined" && data.map((_, rowIndex) => <Cell key={rowIndex} fill={dashboardCombinedPalette[rowIndex % dashboardCombinedPalette.length]} />)}</Bar>)}
                    </ComposedChart> : <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 4, left: 0 }} barGap={3} barCategoryGap="30%" accessibilityLayer aria-label={chart.title}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" horizontal={false} />
                        <XAxis type="number" domain={domain} tick={tick} axisLine={false} tickLine={false} allowDecimals={chart.unit === "percent"} tickFormatter={axisFormat} />
                        <YAxis type="category" dataKey="name" width={116} tick={tick} axisLine={false} tickLine={false} tickFormatter={value => short(String(value), 17)} />
                        {tooltip}{chart.series.map((series, index) => <Bar isAnimationActive={false} key={series.name} dataKey={`value${index}`} name={series.name} fill={series.color} radius={[0, 3, 3, 0]} maxBarSize={13} />)}
                    </BarChart>}
                </ResponsiveContainer>
            </div>
            <div className={circular ? "dashboard-intake-legend" : "dashboard-chart-legend"}>
                {circular ? chart.rows.map((row, index) => <div key={index}><span className="dashboard-series-dot" style={{ backgroundColor: dashboardPalette[index % dashboardPalette.length] }} />
                    <span className="dashboard-intake-name">{row.name}</span><b>{dashboardNumber(row.values[0], locale)}</b>
                </div>) : chart.series.map(series => <span key={series.name}><i className={type === "line" && series === chart.series[1] ? "is-dashed" : undefined} style={type === "combined" && series === chart.series[0] ? { borderColor: "transparent", background: `linear-gradient(90deg, ${dashboardCombinedPalette.join(", ")})` } : { borderColor: series.color }} />{series.name}</span>)}
            </div>
        </div>}
        <details className="dashboard-chart-details"><summary>{t("Ver datos completos")} <span>({chart.table.rows.length})</span></summary><div className="mt-4">
            <Table><TableHead><TableRow>{chart.table.headers.map((header, index) => <Th key={header} align={index ? "right" : "left"}>{header}</Th>)}</TableRow></TableHead>
                <TableBody>{chart.table.rows.map((row, index) => <TableRow key={index}>{row.map((value, cell) => <Td key={cell} align={cell ? "right" : "left"}>{value}</Td>)}</TableRow>)}</TableBody>
            </Table>
        </div></details>
    </section>
}
