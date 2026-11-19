import { useId } from "react"
import { Checkbox } from "@/shared/component/checkbox.component"
import { formatDecimal } from "@/shared/utils/formatDecimal"

export function ReviewBeforeSigning({ producer, product, gross, baskets, tare, net, confirmed, onConfirm, disabled, requireConfirmation = true }: {
    producer?: string; product?: string; gross: number | undefined; baskets: number | undefined; tare: number | null; net: number | null
    confirmed: boolean; onConfirm: (value: boolean) => void; disabled: boolean
    requireConfirmation?: boolean
}) {
    const id = useId()
    const valid = !!producer && !!product && Number.isFinite(gross) && gross! > 0 && Number.isInteger(baskets) && baskets! > 0 && tare !== null && Number.isFinite(tare) && net !== null && Number.isFinite(net) && net >= 0
    return <section className="mb-5 rounded-xl border border-border-light bg-bg-primary p-4" aria-label="Revisión antes de firmar">
        <h2 className="mb-3 font-semibold">Revisa los datos antes de firmar</h2>
        <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt>Productor</dt><dd className="font-semibold">{producer || "—"}</dd></div>
            <div><dt>Producto</dt><dd className="font-semibold">{product || "—"}</dd></div>
            <div><dt>Peso bruto (lb)</dt><dd>{formatDecimal(gross)}</dd></div>
            <div><dt>Canastas</dt><dd>{Number.isInteger(baskets) ? baskets : "—"}</dd></div>
            <div><dt>Tara (lb)</dt><dd>{formatDecimal(tare)}</dd></div>
            <div><dt>Peso neto (lb)</dt><dd>{formatDecimal(net)}</dd></div>
        </dl>
        {requireConfirmation && <Checkbox id={id} label="Verifiqué el productor, producto, pesos y cantidad de canastas." required checked={confirmed}
            disabled={disabled || !valid} onChange={event => onConfirm(event.target.checked)} />}
        {!valid && <p className="mt-2 text-sm text-text-tertiary">Completa y corrige los datos para habilitar la revisión y las firmas.</p>}
    </section>
}
