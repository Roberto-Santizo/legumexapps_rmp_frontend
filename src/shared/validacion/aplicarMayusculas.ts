import type { ChangeEvent } from "react"
import { quitarTildes } from "@/shared/utils/sinTildes"

// La base de datos guarda el texto en mayúsculas y sin tildes (se conserva la Ñ).
export function formatearTexto(value: string): string {
    return quitarTildes(value.toUpperCase())
}

// Convierte lo que se va escribiendo, conservando la posición del cursor
// (si no se restaura, el cursor salta al final del texto cada vez que se
// edita en medio de una palabra ya escrita).
export function aplicarMayusculas(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const input = event.target
    const original = input.value
    const start = input.selectionStart
    const end = input.selectionEnd
    const direction = input.selectionDirection
    const formatted = formatearTexto(original)
    if (formatted === original) return
    input.value = formatted
    if (start !== null && end !== null) {
        input.setSelectionRange(
            formatearTexto(original.slice(0, start)).length,
            formatearTexto(original.slice(0, end)).length,
            direction ?? undefined
        )
    }
}
