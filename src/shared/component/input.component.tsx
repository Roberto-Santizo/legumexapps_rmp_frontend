import { useFieldAccessibility } from "./formField.context"
import { formControlClassName } from "@/shared/component/formControl.styles"
import { forwardRef } from "react"
import type { ChangeEvent, InputHTMLAttributes } from "react"
import { aplicarMayusculas } from "@/shared/validacion/aplicarMayusculas"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    hasError?: boolean
    preserveCase?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { hasError, preserveCase = false, className = "", type, onChange, ...props },
    ref
) {
    const accessibility = useFieldAccessibility(hasError, props["aria-describedby"])
    const isCredential = [props.name, props.id].some(value =>
        value && /^(username|usuario|password|confirmPassword|contraseña)$/i.test(value)
    ) || props.autoComplete === "username" || props.autoComplete === "current-password" || props.autoComplete === "new-password"
    const debeConvertirMayusculas = !preserveCase && !isCredential && (type === undefined || type === "text" || type === "search")

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        if (debeConvertirMayusculas) aplicarMayusculas(event)
        onChange?.(event)
    }

    return (
        <input
            ref={ref}
            type={type}
            onChange={handleChange}
            className={formControlClassName(hasError, `h-12 ${className}`)}
            {...accessibility}
            {...props}
            aria-describedby={accessibility["aria-describedby"]}
        />
    )
})
