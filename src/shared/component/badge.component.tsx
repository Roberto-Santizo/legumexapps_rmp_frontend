import type { HTMLAttributes } from "react"

type BadgeVariant = "exito" | "error" | "aviso" | "info"

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
    exito: "bg-exito-bg text-exito-fg border-exito-bd",
    error: "bg-error-bg text-error-fg border-error-bd",
    aviso: "bg-aviso-bg text-aviso-fg border-aviso-bd",
    info: "bg-info-bg text-info-fg border-info-bd",
}

export function Badge({ variant = "info", className = "", ...props }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-chip border px-2.5 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}
            {...props}
        />
    )
}
