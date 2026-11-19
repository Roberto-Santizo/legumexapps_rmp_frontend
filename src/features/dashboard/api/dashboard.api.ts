import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { dashboardSchema } from "../schema/dashboard.schema"
import type { DashboardQuery } from "../schema/dashboard.schema"
export async function getDashboard(period: DashboardQuery) {
    try {
        const { data } = await api.get("/reports/dashboard", { params: period })
        return dashboardSchema.parse(data).data
    } catch (error) { manejarErrorApi(error) }
}
