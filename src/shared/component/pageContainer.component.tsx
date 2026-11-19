import type { HTMLAttributes } from "react"

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
    size?: "form" | "compact" | "medium" | "wide" | "full"
}

const widths = {
    form: "max-w-2xl lg:max-w-3xl xl:max-w-4xl",
    compact: "max-w-4xl",
    medium: "max-w-5xl",
    wide: "max-w-6xl",
    full: "max-w-none",
}

export function PageContainer({ size = "form", className = "", ...props }: PageContainerProps) {
    return <div className={`mx-auto w-full space-y-6 ${widths[size]} ${className}`} {...props} />
}
