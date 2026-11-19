import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { DashboardAnalytics } from "../component/DashboardAnalytics"
import { DashboardReport } from "../component/DashboardReport"
import { dashboardText } from "../i18n/dashboardCopy"
import type { DashboardLocale } from "../i18n/dashboardCopy"
import "../styles/dashboardCharts.css"

export function Dashboard() {
    const { user } = useAuthentication()
    const [locale, setLocale] = useState<DashboardLocale>("es")
    const t = (text: string) => dashboardText(locale, text)
    if (!user?.permissions.includes("rawMaterialReceptions:view")) return <Navigate to="/403" replace />
    return <PageContainer size="full" className="dashboard-page" lang={locale}>
        <header className="dashboard-page-heading">
            <div><p className="dashboard-eyebrow">Legumex RMP <span className="dashboard-heading-context"><span aria-hidden="true">/</span> {t("Operaciones / Materia prima")}</span></p>
                <h1>{t("Recepción y calidad")}</h1>
                <p className="dashboard-page-description">{t("Una lectura de los ingresos, la evaluación y el cumplimiento de tus productores.")}</p>
            </div>
            <select className="dashboard-language" aria-label={t("Idioma del dashboard")} value={locale} onChange={event => setLocale(event.target.value as DashboardLocale)}>
                <option value="es">Español</option><option value="en">English</option>
            </select>
        </header>
        <DashboardAnalytics locale={locale} />
        <DashboardReport locale={locale} />
    </PageContainer>
}
