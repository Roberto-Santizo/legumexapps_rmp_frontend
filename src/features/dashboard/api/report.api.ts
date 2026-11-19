import axios from "axios"
import api from "@/shared/api/api"

export type FieldReportDates = { startDate: string; endDate: string }

export async function downloadFieldReport(dates: FieldReportDates): Promise<Blob> {
    try {
        const response = await api.get<Blob>("/reports/field.xlsx", { params: dates, responseType: "blob" })
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
            const body = await error.response.data.text()
            let message = "No se pudo descargar el reporte. Intenta nuevamente."
            try {
                const parsed = JSON.parse(body)
                if (typeof parsed.message === "string") message = parsed.message
            } catch { /* Use the fallback for non-JSON server errors. */ }
            throw new Error(message)
        }
        throw error
    }
}
