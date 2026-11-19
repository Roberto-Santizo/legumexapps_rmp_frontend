import type { FieldError } from "react-hook-form"

export function obtenerMensajeErrorCampo(error: FieldError | undefined): string | undefined {
    return error?.message
}
