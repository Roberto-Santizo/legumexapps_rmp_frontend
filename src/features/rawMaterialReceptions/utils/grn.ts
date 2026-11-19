import { z } from "zod"

export const grnNumberSchema = z.string().trim().min(1, "Ingresa el número del GRN")
    .max(251, "El número del GRN es demasiado largo")
    .regex(/^[0-9]+$/, "Ingresa únicamente números, sin letras ni ceros del prefijo")

export function buildGrn(code: "LP" | "LT", grnNumber: string): string {
    return `${code}00${grnNumberSchema.parse(grnNumber)}`
}
