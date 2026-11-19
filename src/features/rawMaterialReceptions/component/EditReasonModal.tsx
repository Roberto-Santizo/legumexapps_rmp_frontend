import { useEffect, useId, useRef, useState } from "react"
import type { FormEvent } from "react"
import { Modal } from "@/shared/component/modal.component"
import { Textarea } from "@/shared/component/textarea.component"
import { Button } from "@/shared/component/button.component"
import { countReasonWords, isValidEditReason, MIN_EDIT_REASON_WORDS, MAX_EDIT_REASON_LENGTH } from "@/shared/validacion/editReason"

export function EditReasonModal({ onConfirm, onCancel, isPending, error }: {
    onConfirm: (reason: string) => void; onCancel: () => void; isPending: boolean; error?: string
}) {
    const [reason, setReason] = useState("")
    const [attempted, setAttempted] = useState(false)
    const id = useId()
    const confirming = useRef(false)
    useEffect(() => { if (!isPending) confirming.current = false }, [isPending, error])
    const words = countReasonWords(reason)
    const valid = isValidEditReason(reason)
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        event.stopPropagation()
        setAttempted(true)
        if (valid && !isPending && !confirming.current) {
            confirming.current = true
            onConfirm(reason.trim())
        }
    }
    return <Modal title="Motivo de la actualización" onClose={onCancel} closeDisabled={isPending}>
        <form onSubmit={submit}>
            <p id={`${id}-help`} className="mb-4 text-sm leading-relaxed text-text-tertiary">Explica qué corriges y por qué es necesario. Escribe al menos siete palabras; los signos y números solos no cuentan. El motivo quedará en el historial junto con tu usuario y los cambios.</p>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold">Razón de la actualización</label>
            <Textarea id={id} required rows={5} maxLength={MAX_EDIT_REASON_LENGTH} value={reason} preserveCase
                disabled={isPending} hasError={attempted && !valid} aria-invalid={attempted && !valid}
                aria-describedby={`${id}-help ${id}-count${attempted && !valid ? ` ${id}-error` : ""}`}
                onChange={event => setReason(event.target.value)} placeholder="Ejemplo: Corrijo el peso registrado porque se verificó nuevamente en báscula." />
            <p id={`${id}-count`} role="status" aria-live="polite" className="mt-2 text-xs text-text-tertiary">{words} palabras · mínimo {MIN_EDIT_REASON_WORDS} · {reason.length}/{MAX_EDIT_REASON_LENGTH} caracteres</p>
            {attempted && !valid && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-error-fg">Escribe un motivo de al menos siete palabras.</p>}
            {error && <p role="alert" className="mt-3 text-sm text-error-fg">{error}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>Volver al formulario</Button>
                <Button type="submit" disabled={!valid || isPending}>{isPending ? "Guardando..." : "Confirmar actualización"}</Button>
            </div>
        </form>
    </Modal>
}
