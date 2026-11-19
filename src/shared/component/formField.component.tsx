import type { ReactNode } from "react"
import { Label } from "@/shared/component/label.component"
import { FieldError } from "@/shared/component/fieldError.component"
import { FormFieldContext } from "./formField.context"

type FormFieldProps = {
    label: string
    htmlFor: string
    error?: string
    required?: boolean
    children: ReactNode
}

export function FormField({ label, htmlFor, error, required = false, children }: FormFieldProps) {
    return (
        <div className="mb-6 min-w-0">
            <Label htmlFor={htmlFor}>{label}{required && <span className="ml-1 text-error-fg" aria-hidden="true">*</span>}</Label>
            <FormFieldContext.Provider value={{ errorId: error ? `${htmlFor}-error` : undefined, invalid: !!error, required }}>
                {children}
            </FormFieldContext.Provider>
            <FieldError id={`${htmlFor}-error`}>{error}</FieldError>
        </div>
    )
}
