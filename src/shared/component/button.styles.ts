export type ButtonVariant = "primary" | "secondary"

const baseClasses =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "border border-primary-dark/20 bg-primary text-dark shadow-sm hover:bg-primary-dark active:translate-y-px",
    secondary:
        "border border-border-light bg-surface text-dark shadow-sm hover:border-slate-300 hover:bg-bg-primary",
}

export function buttonClassName(variant: ButtonVariant = "primary", className = ""): string {
    return `${baseClasses} ${variantClasses[variant]} ${className}`
}

