export function normalizeDefectName(value: string): string {
    return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleUpperCase("es")
        .normalize("NFD").replace(/N\u0303/g, "Ñ").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s*([<>]=?)\s*/g, " $1 ").replace(/(\d)\s*(MM|CM|CMS|LBS)\b/g, "$1 $2")
        .replace(/\s*\/\s*/g, " / ").replace(/\s+/g, " ").trim()
}
