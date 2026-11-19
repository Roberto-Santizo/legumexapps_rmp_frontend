import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

type PageHeaderProps = {
    title: ReactNode
    description?: ReactNode
    icon?: LucideIcon
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            {Icon && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary-dark"><Icon size={22} aria-hidden="true" /></div>}
            <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-dark sm:text-2xl">{title}</h1>
                {description && <p className="mt-1 text-sm text-text-tertiary">{description}</p>}
            </div>
        </div>
    )
}
