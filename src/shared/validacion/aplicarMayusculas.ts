import type { ChangeEvent } from "react"

// Convierte a mayúsculas lo que se va escribiendo, conservando la posición
// del cursor (si no se restaura, el cursor salta al final del texto cada
// vez que se edita en medio de una palabra ya escrita).
export function aplicarMayusculas(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const input = event.target
    const original = input.value
    const start = input.selectionStart
    const end = input.selectionEnd
    const direction = input.selectionDirection
    input.value = original.toUpperCase()
    if (start !== null && end !== null) {
        input.setSelectionRange(
            original.slice(0, start).toUpperCase().length,
            original.slice(0, end).toUpperCase().length,
            direction ?? undefined
        )
    }
}
