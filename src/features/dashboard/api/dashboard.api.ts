import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { dashboardSchema } from "../schema/dashboard.schema"
import type { DashboardQuery } from "../schema/dashboard.schema"
import { ZodError } from "zod"
export async function getDashboard(period: DashboardQuery) {
    try {
        const { data } = await api.get("/reports/dashboard", { params: period })
        if (typeof data === "string" && /^\s*(?:<!doctype\s+html|<html)/i.test(data)) {
            console.error("El dashboard recibió HTML en lugar de JSON. Revisa VITE_BASE_URL y la ruta /api del backend.")
            throw new Error("El dashboard no está conectado correctamente con el servidor. Solicita al administrador revisar la dirección de la API.")
        }
        return dashboardSchema.parse(data).data
    } catch (error) {
        const missingFilterOptions = error instanceof ZodError && error.issues.some(issue =>
            issue.path.length === 2 && issue.path[0] === "data" && issue.path[1] === "filterOptions"
        )
        manejarErrorApi(error, missingFilterOptions
            ? "El backend no está enviando las opciones de los filtros del dashboard. Reinicia el backend con la versión actual del proyecto."
            : undefined)
    }
}
