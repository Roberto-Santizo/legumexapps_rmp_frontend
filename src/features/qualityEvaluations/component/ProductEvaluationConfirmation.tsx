import { useEffect, useRef, useState } from "react"
import { ShieldAlert } from "lucide-react"
import { Card } from "@/shared/component/card.component"
import { Button } from "@/shared/component/button.component"
import { Checkbox } from "@/shared/component/checkbox.component"

type Props = { product: string; variety: string; onConfirm: () => void; onCancel: () => void }

export function ProductEvaluationConfirmation({ product, variety, onConfirm, onCancel }: Props) {
    const [verified, setVerified] = useState(false)
    const heading = useRef<HTMLHeadingElement>(null)
    useEffect(() => { heading.current?.focus() }, [])

    return <div className="mx-auto w-full max-w-3xl">
        <Card>
            <section aria-labelledby="quality-confirmation-title" aria-describedby="quality-confirmation-description">
                <div className="mb-5 flex items-start gap-3">
                    <ShieldAlert size={30} className="shrink-0 text-aviso-fg" aria-hidden="true" />
                    <h2 ref={heading} tabIndex={-1} id="quality-confirmation-title" className="text-xl font-bold leading-snug text-dark outline-none sm:text-2xl">
                        Confirma el producto antes de evaluar
                    </h2>
                </div>
                <p id="quality-confirmation-description" className="mb-5 text-sm leading-relaxed text-text-secondary sm:text-base">
                    Verifica que el producto recibido y su variedad coincidan con esta boleta.
                </p>
                <dl className="mb-5 grid gap-4 rounded-xl border border-border-light bg-bg-primary p-4 sm:grid-cols-2 sm:p-6">
                    <div className="min-w-0"><dt className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Producto</dt>
                        <dd className="break-words text-xl font-bold text-dark sm:text-2xl">{product}</dd></div>
                    <div className="min-w-0"><dt className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Variedad</dt>
                        <dd className="break-words text-xl font-bold text-dark sm:text-2xl">{variety}</dd></div>
                </dl>
                <div className="mb-5 rounded-xl border border-aviso-bd bg-aviso-bg p-4 text-sm leading-relaxed text-aviso-fg sm:text-base">
                    <p className="font-bold">Si no coinciden, solicita la corrección antes de evaluar.</p>
                    <p className="mt-2">Al confirmar, asumes la responsabilidad de evaluar el producto correcto.</p>
                </div>
                <Checkbox id="quality-product-verified" checked={verified} onChange={event => setVerified(event.target.checked)}
                    className="mb-6 items-start leading-relaxed" label="Verifiqué el producto y la variedad. Ambos coinciden." />
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="secondary" onClick={onCancel}>No coincide / Volver</Button>
                    <Button type="button" disabled={!verified} onClick={onConfirm}>Confirmar e iniciar evaluación</Button>
                </div>
            </section>
        </Card>
    </div>
}
