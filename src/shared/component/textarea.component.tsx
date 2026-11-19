import { useFieldAccessibility } from "./formField.context"
import { formControlClassName } from "@/shared/component/formControl.styles"
import { forwardRef } from "react"
import type { ChangeEvent, TextareaHTMLAttributes } from "react"
import { aplicarMayusculas } from "@/shared/validacion/aplicarMayusculas"

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    hasError?: boolean
    preserveCase?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { hasError, preserveCase = false, className = "", onChange, ...props },
    ref
) {
    const accessibility = useFieldAccessibility(hasError, props["aria-describedby"])
    function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
        if (!preserveCase) aplicarMayusculas(event)
        onChange?.(event)
    }

    return (
        <textarea
            ref={ref}
            rows={4}
            onChange={handleChange}
            className={formControlClassName(hasError, `min-h-28 py-3 ${className}`)}
            {...accessibility}
            {...props}
            aria-describedby={accessibility["aria-describedby"]}
        />
    )
})
