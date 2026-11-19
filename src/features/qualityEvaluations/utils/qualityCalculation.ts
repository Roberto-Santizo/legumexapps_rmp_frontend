// Vista previa; el servidor vuelve a calcular usando las tolerancias guardadas.
export function calculateQualityPreview(netWeight: number, defects: { input: number; tolerancePercentage: number }[], allowEmpty = false) {
    const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
    const complete = (defects.length > 0 || allowEmpty) && defects.every(defect => Number.isFinite(defect.input) && defect.input >= 0 && defect.input <= 100)
    const results = defects.map(defect => Number.isFinite(defect.input) && defect.input >= 0 && defect.input <= 100
        ? round(Math.max(0, defect.input - defect.tolerancePercentage)) : null)
    const totalDefects = complete ? round(results.reduce<number>((sum, result) => sum + (result ?? 0), 0)) : null
    const percentage = totalDefects !== null ? round(Math.max(0, 100 - totalDefects)) : null
    const validPounds = percentage !== null ? round(netWeight * percentage / 100) : null
    return { results, totalDefects, percentage, validPounds }
}
