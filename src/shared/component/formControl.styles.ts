const baseClasses =
    "w-full rounded-[10px] border-[1.5px] bg-surface px-4 text-sm text-dark shadow-xs placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-bg-primary disabled:opacity-60"

export function formControlClassName(hasError = false, className = ""): string {
    const stateClasses = hasError
        ? "border-error-fg focus:ring-error-bg"
        : "border-border-light hover:border-slate-300 focus:border-primary"
    return `${baseClasses} ${stateClasses} ${className}`
}
