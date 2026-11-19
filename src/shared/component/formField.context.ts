import { createContext, useContext } from "react"

export const FormFieldContext = createContext<{ errorId?: string; invalid: boolean; required: boolean }>({ invalid: false, required: false })

export function useFieldAccessibility(hasError = false, describedBy?: string) {
    const field = useContext(FormFieldContext)
    return {
        "aria-invalid": hasError || field.invalid || undefined,
        "aria-required": field.required || undefined,
        "aria-describedby": [...new Set([describedBy, field.errorId].filter(Boolean))].join(" ") || undefined,
    }
}
