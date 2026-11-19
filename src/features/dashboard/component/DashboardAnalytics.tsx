import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Download, LoaderCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/component/button.component"
import { Combobox } from "@/shared/component/combobox.component"
import { downloadFile } from "@/shared/utils/downloadFile"
import { getDashboard } from "../api/dashboard.api"
import { buildDashboardCharts } from "../model/dashboardPresentation"
import { DashboardChart } from "./DashboardChart"
import { DashboardMetrics } from "./DashboardMetrics"
import { DashboardDateField } from "./DashboardDateField"
import { currentMonthRange, formatDashboardDate } from "../utils/dashboardPeriod"
import { dashboardText } from "../i18n/dashboardCopy"
import { formatGuatemalaDateTime, isIsoDate } from "@/shared/utils/guatemalaDate"
import type { DashboardLocale } from "../i18n/dashboardCopy"
import type { DashboardData, DashboardQuery } from "../schema/dashboard.schema"
import { sameDashboardFilters, dashboardFilterLabels } from "../utils/dashboardFilters"

export function DashboardAnalytics({ locale = "es" }: { locale?: DashboardLocale }) {
    const t = (text: string) => dashboardText(locale, text)
    const [period, setPeriod] = useState<DashboardQuery>(currentMonthRange)
    const [startDate, setStartDate] = useState(period.startDate), [endDate, setEndDate] = useState(period.endDate)
    const [producerId, setProducerId] = useState<number | undefined>()
    const [productId, setProductId] = useState<number | undefined>()
    const draft = { startDate, endDate, producerId, productId }
    const invalid = !isIsoDate(startDate) || !isIsoDate(endDate) || startDate > endDate
    const unapplied = !sameDashboardFilters(draft, period)
    const query = useQuery({ queryKey: ["dashboard-analytics", period], queryFn: () => getDashboard(period), placeholderData: previous => previous, refetchOnWindowFocus: false })
    const data = query.data
    const loadedSelection = !!data && sameDashboardFilters(data.period, period)
    const [lastOptions, setLastOptions] = useState<DashboardData["filterOptions"]>({ producers: [], products: [] })
    useEffect(() => { if (data) setLastOptions(data.filterOptions) }, [data])
    const options = data?.filterOptions ?? lastOptions
    function selectOptions(rows: { id: number; name: string }[], selected: number | undefined) {
        const entries = rows.map(row => ({ value: row.id, label: row.name, description: `#${row.id}` }))
        if (selected !== undefined && !rows.some(row => row.id === selected)) entries.push({ value: selected, label: `#${selected}`, description: t("Sin boletas en este período") })
        return entries
    }
    const exportPdf = useMutation({
        mutationFn: async () => {
            if (!data) throw new Error(t("Primero carga el dashboard"))
            const [{ pdf }, { DashboardPdfDocument }] = await Promise.all([import("@react-pdf/renderer"), import("../pdf/DashboardPdfDocument")])
            const blob = await pdf(<DashboardPdfDocument data={data} />).toBlob()
            return { blob, period: data.period }
        },
        onSuccess: ({ blob, period: selected }) => { downloadFile(blob, `dashboard-calidad_${selected.startDate}_${selected.endDate}.pdf`); toast.success(t("Dashboard descargado correctamente")) },
        onError: error => toast.error(error.message),
    })
    function apply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (invalid) return
        if (sameDashboardFilters(draft, period)) void query.refetch()
        else setPeriod(draft)
    }
    const charts = data ? buildDashboardCharts(data, locale) : []
    const chartOrder = ["trend", "intake", "consignments", "products", "defects", "producers", "producers-low"]
    return <section className="dashboard-visuals" aria-label={t("Recepción y calidad")}>
        <div className="dashboard-period-bar">
            <form onSubmit={apply} className="dashboard-period-form">
                <div className="dashboard-period-label"><span className="dashboard-eyebrow">{t("Período de análisis")}</span><span>Guatemala · UTC−6</span></div>
                <DashboardDateField label={t("Fecha inicial")} id="dashboard-start" value={startDate} max={endDate || undefined} onChange={setStartDate} />
                <DashboardDateField label={t("Fecha final")} id="dashboard-end" value={endDate} min={startDate || undefined} error={isIsoDate(startDate) && isIsoDate(endDate) && startDate > endDate ? t("Revisa el orden de las fechas") : undefined} onChange={setEndDate} />
                <div className="dashboard-catalog-filters">
                    <div className="dashboard-filter-field"><label htmlFor="dashboard-producer">{t("Productor")}</label>
                        <Combobox id="dashboard-producer" value={producerId ?? null} onChange={value => setProducerId(value ?? undefined)} options={selectOptions(options.producers, producerId)} placeholder={t("Todos los productores")} emptyMessage={t("Sin resultados en este período")} disabled={query.isFetching} />
                    </div>
                    <div className="dashboard-filter-field"><label htmlFor="dashboard-product">{t("Producto / variedad")}</label>
                        <Combobox id="dashboard-product" value={productId ?? null} onChange={value => setProductId(value ?? undefined)} options={selectOptions(options.products, productId)} placeholder={t("Todos los productos")} emptyMessage={t("Sin resultados en este período")} disabled={query.isFetching} />
                    </div>
                </div>
                <div className="dashboard-period-actions">
                    <Button type="submit" disabled={invalid || query.isFetching}><RefreshCw size={15} className={query.isFetching ? "animate-spin" : ""} aria-hidden="true" />{t(query.isFetching ? "Cargando..." : "Ver dashboard")}</Button>
                    <button type="button" className="dashboard-text-button" disabled={query.isFetching} onClick={() => {
                        const month = currentMonthRange()
                        setStartDate(month.startDate); setEndDate(month.endDate)
                        const next = { ...month, producerId, productId }
                        if (sameDashboardFilters(next, period)) void query.refetch()
                        else setPeriod(next)
                    }}>{t("Mes en curso")}</button>
                    <button type="button" className="dashboard-text-button" disabled={query.isFetching} onClick={() => { setProducerId(undefined); setProductId(undefined) }}>{t("Limpiar productor y producto")}</button>
                </div>
            </form>
            <Button type="button" variant="secondary" disabled={!loadedSelection || unapplied || invalid || query.isFetching || query.isError || exportPdf.isPending} onClick={() => exportPdf.mutate()}>
                {exportPdf.isPending ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}{t(exportPdf.isPending ? "Preparando PDF..." : "Descargar dashboard PDF")}
            </Button>
        </div>
        {unapplied && <p className="dashboard-period-notice" role="status">{t("Pulsa Ver dashboard para aplicar las fechas, el productor y el producto y habilitar su descarga.")}</p>}
        {query.isError && <div role="alert" className="dashboard-error"><div><h2>{t("No se pudieron cargar los gráficos del dashboard.")}</h2><p>{query.error.message}</p></div>
            <Button type="button" variant="secondary" disabled={query.isFetching} onClick={() => void query.refetch()}>{t("Reintentar")}</Button>
        </div>}
        {query.isLoading && <div role="status" className="dashboard-loading"><p>{t("Cargando indicadores del período seleccionado…")}</p>
            <div className="dashboard-loading-metrics" aria-hidden="true">{[1, 2, 3].map(key => <div key={key}><span /><span /><span /></div>)}</div>
            <div className="dashboard-loading-chart" aria-hidden="true" />
        </div>}
        {data && !query.isError && <>
            <div className="dashboard-section-heading"><div><h2>{t("Resumen del período")}</h2><p>{formatDashboardDate(data.period.startDate)} — {formatDashboardDate(data.period.endDate)}</p></div>
                <p className="dashboard-updated">{t("Actualizado")} <time dateTime={data.generatedAt}>{formatGuatemalaDateTime(data.generatedAt)}</time></p>
            </div>
            <p className="dashboard-applied-filters">{dashboardFilterLabels(data, locale).join(" · ")}</p>
            {!data.summary.receipts && <div className="dashboard-no-data" role="status"><h3>{t("Sin boletas en este período")}</h3><p>{t("Selecciona otro rango de fechas para consultar la operación.")} {t("Prueba también con otro productor o producto.")}</p></div>}
            {data.summary.receipts > 0 && <p className="dashboard-filter-help">{t("Para comparar productores del mismo producto, selecciona el producto y deja Todos los productores.")}</p>}
            <DashboardMetrics data={data} locale={locale} />
            <div className="dashboard-section-heading dashboard-analysis-heading"><div><span className="dashboard-eyebrow">{t("Lectura operativa")}</span><h2>{t("Volumen, tendencias y cumplimiento")}</h2></div></div>
            <div className="dashboard-chart-grid">{chartOrder.map(id => {
                const chart = charts.find(item => item.id === id)
                return chart ? <DashboardChart key={id} chart={chart} locale={locale} /> : null
            })}</div>
            <details className="dashboard-methodology"><summary>{t("Cómo se calculan los indicadores")}</summary><div>
                <p>{t("Aprobado: calidad igual o mayor al porcentaje aceptado guardado en la evaluación.")}</p>
                <dl><div><dt>{t("Evaluaciones comparables")}</dt><dd>{data.summary.comparable}</dd></div><div><dt>{t("Sin parámetro histórico")}</dt><dd>{data.summary.missingThreshold}</dd></div></dl>
                <p>{t("Las evaluaciones sin parámetro histórico se excluyen de la tasa de aprobación. La calidad promedio se calcula por boleta evaluada. El ranking exige al menos 3 evaluaciones comparables por productor.")}</p>
                <p>{t("Los rankings de mayor y menor calidad se ordenan por calidad promedio dentro de los filtros aplicados. En empate se usa aprobación y luego tamaño de muestra. Menos de 3 evaluaciones comparables: se muestran en la tabla, sin entrar al ranking.")}</p>
            </div></details>
        </>}
    </section>
}
