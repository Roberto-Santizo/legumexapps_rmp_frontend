/** Display only: never use the formatted string for calculations or persistence. */
export function formatDecimal(value: number | null | undefined, locale = "en-US"): string {
    if (value == null || !Number.isFinite(value)) return "—"
    return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
