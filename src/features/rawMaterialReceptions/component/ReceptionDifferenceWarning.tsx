import { formatDecimal } from "@/shared/utils/formatDecimal"
import { useEffect } from "react"
import { toast } from "sonner"
import { hasLargeReceptionDifference } from "../utils/receptionDifference"

export function ReceptionDifferenceWarning({ fieldNetWeight, plantNetWeight }: { fieldNetWeight: number | null | undefined; plantNetWeight: number | null }) {
    const exceedsLimit = hasLargeReceptionDifference(fieldNetWeight, plantNetWeight)
    useEffect(() => {
        if (exceedsLimit) toast.warning("La diferencia entre campo y planta supera las 100 lb. Verifica que estés recibiendo la boleta correcta; puedes continuar si los datos son correctos.", {
            duration: 15000,
            closeButton: true,
            style: { background: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" },
        })
    }, [exceedsLimit])
    if (fieldNetWeight == null || plantNetWeight == null || !Number.isFinite(fieldNetWeight) || !Number.isFinite(plantNetWeight) || plantNetWeight < 0) return null
    const difference = Math.abs(plantNetWeight - fieldNetWeight)
    if (difference <= 100) return null
    return <div role="status" aria-live="polite" className="mb-4 rounded-xl border border-error-bd bg-error-bg p-4 text-sm text-error-fg">
        <strong>La diferencia de peso neto supera las 100 lb.</strong> Campo: {formatDecimal(fieldNetWeight)} lb; planta: {formatDecimal(plantNetWeight)} lb; diferencia: {formatDecimal(difference)} lb.
        <p>Asegúrate de estar recibiendo la boleta correcta y verifica los pesos y las canastas. Si los datos son correctos, puedes continuar normalmente.</p>
    </div>
}
