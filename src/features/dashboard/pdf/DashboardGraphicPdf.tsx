import { Svg, Path, Circle, Line, Rect, Text } from "@react-pdf/renderer"
import type { DashboardChart } from "../model/dashboardPresentation"
import { dashboardChartType, dashboardPalette, dashboardCombinedPalette, dashboardColors } from "../model/dashboardPresentation"

export function DashboardGraphicPdf({ chart }: { chart: DashboardChart }) {
    const type = dashboardChartType(chart.id)
    if (type === "donut") {
        const total = chart.rows.reduce((sum, row) => sum + (row.values[0] ?? 0), 0)
        let angle = -Math.PI / 2
        return <Svg width={556} height={170} viewBox="0 0 556 170">
            {chart.rows.map((row, index) => {
                const share = total ? (row.values[0] ?? 0) / total : 0
                const start = angle; angle += share * Math.PI * 2
                const color = dashboardPalette[index % dashboardPalette.length]
                if (share >= 0.999999) return <Circle key={index} cx={278} cy={82} r={61} fill="none" stroke={color} strokeWidth={24} />
                if (!share) return null
                const x = (a: number) => 278 + 61 * Math.cos(a), y = (a: number) => 82 + 61 * Math.sin(a)
                return <Path key={index} d={`M ${x(start)} ${y(start)} A 61 61 0 ${share > 0.5 ? 1 : 0} 1 ${x(angle)} ${y(angle)}`} fill="none" stroke={color} strokeWidth={24} />
            })}
            <Text x={278} y={83} textAnchor="middle" style={{ fontSize: 24 }} fill={dashboardColors.ink}>{String(total)}</Text>
            <Text x={278} y={99} textAnchor="middle" style={{ fontSize: 7 }} fill="#94a3b8">BOLETAS · TOP 5</Text>
        </Svg>
    }
    const left = 32, width = 510, top = 12, height = 130, bottom = top + height
    const x = (index: number) => left + (index + 0.5) * width / chart.rows.length
    const maximum = chart.unit === "percent" ? 100 : Math.max(1, ...chart.rows.flatMap(row => row.values.map(value => value ?? 0)))
    const y = (value: number) => bottom - value / maximum * height
    return <Svg width={556} height={190} viewBox="0 0 556 190">
        {[0, maximum / 4, maximum / 2, maximum * 3 / 4, maximum].map(value => <Line key={value} x1={left} x2={left + width} y1={y(value)} y2={y(value)} stroke="#e2e8f0" strokeWidth={0.5} />)}
        {[0, maximum / 2, maximum].map(value => <Text key={value} x={left - 5} y={y(value) + 2} textAnchor="end" style={{ fontSize: 6 }} fill="#94a3b8">{value}{chart.unit === "percent" ? "%" : ""}</Text>)}
        {chart.rows.map((row, index) => <Text key={index} x={x(index)} y={bottom + 14} textAnchor="middle" style={{ fontSize: 6 }} fill="#64748b">{row.name.length > 15 ? `${row.name.slice(0, 14)}…` : row.name}</Text>)}
        {chart.series.map((series, seriesIndex) => {
            if (type === "line" || (type === "combined" && seriesIndex === 1)) {
                let started = false
                const d = chart.rows.map((row, index) => {
                    const value = row.values[seriesIndex]
                    if (value === null) { started = false; return "" }
                    const command = started ? "L" : "M"; started = true
                    return `${command} ${x(index)} ${y(value)}`
                }).join(" ")
                return <Path key={seriesIndex} d={d || "M 0 0"} stroke={series.color} strokeWidth={2.2} strokeDasharray={type === "line" && seriesIndex === 1 ? "6 4" : undefined} fill="none" />
            }
            return chart.rows.map((row, index) => {
                const value = row.values[seriesIndex]
                if (value === null) return null
                const barWidth = Math.min(22, width / chart.rows.length / 3)
                return <Rect key={`${seriesIndex}-${index}`} x={x(index) + (seriesIndex - chart.series.length / 2) * (barWidth + 2)} y={y(value)} width={barWidth} height={value / maximum * height} rx={2} fill={type === "combined" ? dashboardCombinedPalette[index % dashboardCombinedPalette.length] : series.color} />
            })
        })}
        {chart.series.map((series, seriesIndex) => (type === "line" || (type === "combined" && seriesIndex === 1)) && chart.rows.map((row, index) => row.values[seriesIndex] !== null && <Circle key={`${seriesIndex}-${index}`} cx={x(index)} cy={y(row.values[seriesIndex]!)} r={3} fill={series.color} />))}
    </Svg>
}
