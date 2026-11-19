import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"

import { buttonClassName } from "@/shared/component/button.styles"
import type { ButtonVariant } from "@/shared/component/button.styles"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant = "primary", className = "", ...props },
    ref
) {
    return <button ref={ref} className={buttonClassName(variant, className)} {...props} />
})
