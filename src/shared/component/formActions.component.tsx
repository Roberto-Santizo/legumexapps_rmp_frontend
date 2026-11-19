import { Save } from "lucide-react"
import { Button } from "@/shared/component/button.component"

type FormActionsProps = {
    onCancel: () => void
    isPending?: boolean
    submitLabel?: string
    submitDisabled?: boolean
}

export function FormActions({ onCancel, isPending = false, submitLabel = "Guardar", submitDisabled = false }: FormActionsProps) {
    return (
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-border-light pt-6">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isPending || submitDisabled}>
                <Save size={18} aria-hidden="true" />
                {isPending ? "Guardando..." : submitLabel}
            </Button>
        </div>
    )
}
