import type { DashboardData } from "../schema/dashboard.schema"
import type { DashboardLocale } from "../i18n/dashboardCopy"
import { dashboardText } from "../i18n/dashboardCopy"
import { dashboardKpis } from "../model/dashboardPresentation"

export function DashboardMetrics({ data, locale }: { data: DashboardData; locale: DashboardLocale }) {
    const metrics = dashboardKpis(data, locale)
    const t = (text: string) => dashboardText(locale, text)
    const primary = [
        { index: 0, detail: "Volumen registrado en campo", tone: "volume" },
        { index: 2, detail: "Promedio por boleta evaluada", tone: "quality" },
        { index: 3, detail: "Sobre evaluaciones comparables", tone: "approval" },
    ]
    return <div className="dashboard-metrics">
        <dl className="dashboard-primary-metrics">{primary.map(({ index, detail, tone }) => <div key={index} className={`dashboard-primary-metric dashboard-metric-${tone}`}>
            <dt>{metrics[index].label}</dt><dd>{metrics[index].value}</dd><p>{t(detail)}</p>
        </div>)}</dl>
        <dl className="dashboard-secondary-metrics">{[1, 4, 5, 6, 7].map(index => <div key={index}>
            <dt>{metrics[index].label}</dt><dd>{metrics[index].value}</dd>
        </div>)}</dl>
    </div>
}
