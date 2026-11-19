import { useState } from "react"
import type { FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { Download, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/component/button.component"
import { downloadFile } from "@/shared/utils/downloadFile"
import { downloadFieldReport } from "../api/report.api"
import { currentMonthRange } from "../utils/dashboardPeriod"
import { dashboardText } from "../i18n/dashboardCopy"
import type { DashboardLocale } from "../i18n/dashboardCopy"
import { DashboardDateField } from "./DashboardDateField"
import { isIsoDate } from "@/shared/utils/guatemalaDate"

export function DashboardReport({ locale }: { locale: DashboardLocale }) {
    const t = (text: string) => dashboardText(locale, text)
    const [initialPeriod] = useState(currentMonthRange)
    const [startDate, setStartDate] = useState(initialPeriod.startDate)
    const [endDate, setEndDate] = useState(initialPeriod.endDate)
    const invalidRange = isIsoDate(startDate) && isIsoDate(endDate) && startDate > endDate
    const invalidDates = !isIsoDate(startDate) || !isIsoDate(endDate) || invalidRange
    const report = useMutation({ mutationFn: downloadFieldReport,
        onSuccess: (blob, dates) => {
            downloadFile(blob, `materia-prima_${dates.startDate}_${dates.endDate}.xlsx`)
            toast.success(t("Reporte descargado correctamente"))
        }, onError: error => toast.error(error.message),
    })
    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (invalidDates || report.isPending) return
        report.mutate({ startDate, endDate })
    }
    return <section className="dashboard-report" aria-labelledby="dashboard-report-title">
        <div className="dashboard-report-copy"><span className="dashboard-eyebrow">{t("Exportación operativa")}</span>
            <h2 id="dashboard-report-title">{t("Reporte de materia prima")}</h2>
            <p>{t("Solo boletas cerradas, con GRN, datos de campo y planta, variación de calidad y estado de consignación.")}</p>
            <small>{t("Elige las fechas de creación de las boletas. Se incluyen ambos días; este rango es independiente del análisis superior.")}</small>
        </div>
        <form onSubmit={onSubmit}>
            <div className="dashboard-report-dates">
                <DashboardDateField label={t("Fecha inicial")} id="reportStartDate" value={startDate} max={endDate || undefined} disabled={report.isPending} onChange={setStartDate} />
                <DashboardDateField label={t("Fecha final")} id="reportEndDate" value={endDate} min={startDate || undefined} disabled={report.isPending}
                    error={invalidRange ? t("La fecha final debe ser igual o posterior a la inicial") : undefined} onChange={setEndDate} />
            </div>
            <div className="dashboard-report-download"><span role="status" aria-live="polite">{t(report.isPending ? "Preparando las boletas del rango seleccionado." : "Formato .xlsx · Datos de campo y planta")}</span>
                <Button type="submit" variant="secondary" disabled={report.isPending || invalidDates}>
                    {report.isPending ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
                    {t(report.isPending ? "Generando Excel..." : "Descargar Excel")}
                </Button>
            </div>
        </form>
    </section>
}
