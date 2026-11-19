import type { DashboardData, DashboardQuery } from "../schema/dashboard.schema"
import { dashboardText } from "../i18n/dashboardCopy"
import type { DashboardLocale } from "../i18n/dashboardCopy"

export function sameDashboardFilters(a: DashboardQuery, b: DashboardQuery) {
    return a.startDate === b.startDate && a.endDate === b.endDate
        && a.producerId === b.producerId && a.productId === b.productId
}

export function dashboardFilterLabels(data: DashboardData, locale: DashboardLocale = "es") {
    const t = (text: string) => dashboardText(locale, text)
    const producer = data.filterOptions.producers.find(row => row.id === data.period.producerId)
    const product = data.filterOptions.products.find(row => row.id === data.period.productId)
    return [
        `${t("Productor")}: ${data.period.producerId === undefined ? t("Todos los productores") : producer?.name ?? `#${data.period.producerId}`}`,
        `${t("Producto / variedad")}: ${data.period.productId === undefined ? t("Todos los productos") : product?.name ?? `#${data.period.productId}`}`,
    ]
}
