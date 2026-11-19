import { formatGuatemalaDate } from "@/shared/utils/guatemalaDate"

export function currentMonthRange(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guatemala", year: "numeric", month: "2-digit" }).formatToParts(now)
    const year = parts.find(part => part.type === "year")!.value
    const month = parts.find(part => part.type === "month")!.value
    const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate()
    return { startDate: `${year}-${month}-01`, endDate: `${year}-${month}-${String(lastDay).padStart(2, "0")}` }
}

export function formatDashboardDate(date: string) {
    return formatGuatemalaDate(date)
}

