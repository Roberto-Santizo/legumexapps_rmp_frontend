export function normalizeDefectName(value: string): string {
    return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleUpperCase("es")
        .normalize("NFD").replace(/N\u0303/g, "Ñ").replace(/[\u0300-\u036f]/g, "")
}
