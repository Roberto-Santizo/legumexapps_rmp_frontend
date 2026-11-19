export function guatemalaDate(now = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guatemala", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now)
    const part = (type: string) => parts.find(value => value.type === type)!.value
    return `${part("year")}-${part("month")}-${part("day")}`
}

export function documentDateRange(now = new Date()) {
    const today = guatemalaDate(now)
    const previous = new Date(`${today}T12:00:00Z`)
    previous.setUTCDate(previous.getUTCDate() - 1)
    return { today, yesterday: previous.toISOString().slice(0, 10) }
}

export function isAllowedDocumentDate(value: string, now = new Date()) {
    const { today, yesterday } = documentDateRange(now)
    return value === today || value === yesterday
}
