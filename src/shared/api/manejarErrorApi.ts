import { isAxiosError } from "axios"
import { ZodError } from "zod"
import type { RespuestaMensaje } from "./respuestaApi.esquema"

export class ApiValidationError extends Error {
    readonly details: { path: string; message: string }[]
    constructor(message: string, details: { path: string; message: string }[]) {
        super([message, ...details.slice(0, 3).map(detail => detail.message)].join(". "))
        this.name = "ApiValidationError"
        this.details = details
    }
}

export class ApiResponseFormatError extends Error {
    readonly details: { path: string; code: string; expected?: string }[]
    constructor(details: { path: string; code: string; expected?: string }[], message = "La respuesta del servidor no tiene el formato esperado") {
        super(message)
        this.name = "ApiResponseFormatError"
        this.details = details
    }
}

export function manejarErrorApi(error: unknown, responseMessage?: string): never {
    if (isAxiosError<RespuestaMensaje>(error) && error.response) {
        const body = error.response.data as RespuestaMensaje & { details?: unknown }
        const details = Array.isArray(body?.details) ? body.details.flatMap(detail =>
            detail && typeof detail === "object" && typeof detail.path === "string" && typeof detail.message === "string"
                ? [{ path: detail.path, message: detail.message }] : []) : []
        const message = typeof body?.message === "string" ? body.message : "No se pudo completar la solicitud"
        if (details.length) throw new ApiValidationError(message, details)
        throw new Error(message)
    }

    if (error instanceof ZodError) {
        const details = error.issues.map(issue => ({
            path: issue.path.join("."), code: issue.code,
            ...(issue.code === "invalid_type" ? { expected: issue.expected } : {}),
        }))
        console.error("Respuesta de API incompatible", details)
        throw new ApiResponseFormatError(details, responseMessage)
    }

    throw error
}
