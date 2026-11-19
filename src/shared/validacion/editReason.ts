export const MIN_EDIT_REASON_WORDS = 7
export const MAX_EDIT_REASON_LENGTH = 1000

// Contar palabras con letras Unicode, conservando acentos y palabras con guion.
// Signos, números sueltos y emojis no constituyen palabras.
export function countReasonWords(reason: string): number {
    return reason.normalize("NFC").match(/\p{L}[\p{L}\p{M}\p{N}]*(?:[-'’][\p{L}\p{M}\p{N}]+)*/gu)?.length ?? 0
}

export function isValidEditReason(reason: string): boolean {
    return reason.trim().length <= MAX_EDIT_REASON_LENGTH && countReasonWords(reason) >= MIN_EDIT_REASON_WORDS
}
