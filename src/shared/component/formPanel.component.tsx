import type { ComponentPropsWithoutRef } from "react"
import { Card } from "@/shared/component/card.component"

export function FormPanel({ children, ...props }: ComponentPropsWithoutRef<"form">) {
    return (
        <Card>
            <form {...props}>{children}</form>
        </Card>
    )
}
