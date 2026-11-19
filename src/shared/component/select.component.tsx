import { useFieldAccessibility } from "./formField.context"
import { formControlClassName } from "@/shared/component/formControl.styles"
import { forwardRef } from "react"
import type { SelectHTMLAttributes } from "react"

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { hasError, className = "", ...props },
    ref
) {
    const accessibility = useFieldAccessibility(hasError, props["aria-describedby"])
    return (
        <select
            ref={ref}
            className={formControlClassName(hasError, `h-12 ${className}`)}
            {...accessibility}
            {...props}
            aria-describedby={accessibility["aria-describedby"]}
        />
    )
})
