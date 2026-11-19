import type { HTMLAttributes } from "react"

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`form-card rounded-card border border-border-light bg-surface p-5 shadow-card sm:p-8 ${className}`} {...props} />
}
