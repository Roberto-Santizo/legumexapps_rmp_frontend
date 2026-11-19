import { TriangleAlert } from "lucide-react"
import { truckGrossWeightError } from "../utils/truckWeight"
import { formatDecimal } from "@/shared/utils/formatDecimal"

export function GrossWeightWarning({ id, value, baskets, plate, validate = true }: Readonly<{
    id: string; value: number | undefined; baskets?: number; plate?: { name: string; maxGrossWeight?: number | null } | null; validate?: boolean
}>) {
    const error = validate ? truckGrossWeightError(plate, value) : null
    return (
        <div id={id} role="status" aria-live="polite" aria-atomic="true">
            {typeof baskets === "number" && Number.isFinite(baskets) && baskets >= 50000 && <p className="mt-2 rounded-xl border border-aviso-bd bg-aviso-bg p-3 text-sm text-aviso-fg">La cantidad de canastas es muy alta. Verifica que no haya un error de digitación; si es correcta, puedes continuar.</p>}
            {plate?.maxGrossWeight != null && <p className="mt-2 text-sm text-text-tertiary">Peso bruto máximo de {plate.name}: {formatDecimal(plate.maxGrossWeight)} lb.</p>}
            {error && (
                <div role="alert" className="mt-2 flex items-start gap-2 rounded-[10px] border border-error-fg bg-error-bg px-4 py-3 text-error-fg">
                    <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-sm">
                        {error}
                    </p>
                </div>
            )}
        </div>
    )
}
