export function hasLargeReceptionDifference(field: number | null | undefined, plant: number | null) {
    return field != null && plant != null && Number.isFinite(field) && Number.isFinite(plant) && plant >= 0 && Math.abs(plant - field) > 100
}
