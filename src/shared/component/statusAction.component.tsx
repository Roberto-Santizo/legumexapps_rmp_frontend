import { Power } from "lucide-react"

type StatusActionProps = {
    active: boolean
    name: string
    onChange: (active: boolean) => void
    disabled?: boolean
    disabledReason?: string
}

export function StatusAction({ active, name, onChange, disabled, disabledReason }: StatusActionProps) {
    const action = active ? "Desactivar" : "Activar"
    return (
        <button
            type="button"
            disabled={disabled}
            title={disabledReason ?? `${action}: ${name}`}
            onClick={() => {
                if (window.confirm(`¿${action} "${name}"?`)) onChange(!active)
            }}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${active ? "border-error-bd text-error-fg hover:bg-error-bg" : "border-exito-bd text-exito-fg hover:bg-exito-bg"}`}
        >
            <Power size={14} aria-hidden="true" />
            {action}
        </button>
    )
}
