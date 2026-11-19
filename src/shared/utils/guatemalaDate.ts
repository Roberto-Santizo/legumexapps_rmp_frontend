export const GUATEMALA_TIME_ZONE = "America/Guatemala"

export function isIsoDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T12:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function formatGuatemalaDate(value: string | Date): string {
    if (typeof value === "string" && isIsoDate(value)) return value.split("-").reverse().join("/")
    const date = new Date(value)
    if (!Number.isFinite(date.getTime())) return "—"
    const parts = new Intl.DateTimeFormat("es-GT", {
        timeZone: GUATEMALA_TIME_ZONE, day: "2-digit", month: "2-digit", year: "numeric",
    }).formatToParts(date)
    const part = (type: string) => parts.find(entry => entry.type === type)?.value ?? ""
    return `${part("day")}/${part("month")}/${part("year")}`
}

export function formatGuatemalaDateTime(value: string | Date): string {
    const date = new Date(value)
    if (!Number.isFinite(date.getTime())) return "—"
    const time = new Intl.DateTimeFormat("es-GT", {
        timeZone: GUATEMALA_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).format(date)
    return `${formatGuatemalaDate(date)} ${time}`
}

export function parseGuatemalaDateInput(value: string): string {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
    if (!match) return value
    const iso = `${match[3]}-${match[2]}-${match[1]}`
    return isIsoDate(iso) ? iso : value
}

export function dateInputError(value: string, min?: string, max?: string): string {
    if (!value) return ""
    if (!isIsoDate(value)) return "Ingresa una fecha válida en formato DD/MM/AAAA."
    if (min && isIsoDate(min) && value < min) return `La fecha mínima es ${formatGuatemalaDate(min)}.`
    if (max && isIsoDate(max) && value > max) return `La fecha máxima es ${formatGuatemalaDate(max)}.`
    return ""
}
