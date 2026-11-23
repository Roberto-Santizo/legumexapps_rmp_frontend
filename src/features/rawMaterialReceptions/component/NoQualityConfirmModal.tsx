import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Modal } from "@/shared/component/modal.component"
import { Button } from "@/shared/component/button.component"
import { Checkbox } from "@/shared/component/checkbox.component"

type Props = {
    productLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

// Barrera para no omitir el porcentaje de campo por comodidad: exige
// confirmar expresamente que el producto no tuvo evaluación de calidad.
export function NoQualityConfirmModal({ productLabel, onConfirm, onCancel }: Props) {
    const [acknowledged, setAcknowledged] = useState(false)
    return <Modal title="¿Registrar sin porcentaje de calidad?" onClose={onCancel}>
        <div className="mb-5 flex gap-3 rounded-xl border border-aviso-fg/20 bg-aviso-bg p-4 text-sm leading-relaxed text-aviso-fg">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
                <p className="font-semibold">Usa esta opción solo si el producto NO fue evaluado en campo.</p>
                <p className="mt-1">
                    La boleta {productLabel ? <>de <span className="font-semibold">{productLabel}</span> </> : ""}se creará
                    sin porcentaje de calidad de campo y el porcentaje se definirá con la evaluación al recibir en planta.
                    Si el producto sí tiene evaluación de calidad, ingresa el porcentaje.
                </p>
            </div>
        </div>
        <div className="mb-6 rounded-xl border border-border-light p-3.5">
            <Checkbox
                id="confirm-no-quality"
                label="Confirmo que este producto no tiene evaluación de calidad en campo"
                checked={acknowledged}
                onChange={event => setAcknowledged(event.target.checked)}
            />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border-light pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onCancel}>No, ingresar porcentaje</Button>
            <Button type="button" disabled={!acknowledged} onClick={onConfirm}>Sí, continuar sin porcentaje</Button>
        </div>
    </Modal>
}
