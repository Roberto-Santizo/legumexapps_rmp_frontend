import { Checkbox } from "@/shared/component/checkbox.component"
import type { Permission } from "../schema/permission.schema"
import { comparePermissions, presentPermission } from "../permissionPresentation"

type PermissionSelectorProps = {
    permissions: Permission[]
    value: number[]
    onChange: (ids: number[]) => void
    disabled?: boolean
    loading?: boolean
    error?: string
}

export function PermissionSelector({ permissions, value, onChange, disabled, loading, error }: PermissionSelectorProps) {
    if (loading) return <p className="text-sm text-text-tertiary">Cargando permisos...</p>
    if (error) return <p role="alert" className="text-sm text-error-fg">{error}</p>
    if (!permissions.length) return <p className="text-sm text-text-tertiary">No hay permisos disponibles.</p>

    const groups = new Map<string, Permission[]>()
    for (const permission of [...permissions].sort(comparePermissions)) {
        const module = presentPermission(permission.name).module
        const group = groups.get(module) ?? []
        group.push(permission)
        groups.set(module, group)
    }

    return (
        <div className="space-y-4">
            {[...groups].map(([module, items]) => (
                <fieldset key={module} className="rounded-xl border border-border-light px-4 pb-4">
                    <legend className="px-2 text-sm font-semibold text-dark">{module}</legend>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {items.map(permission => (
                            <Checkbox
                                key={permission.id}
                                id={`permission-${permission.id}`}
                                label={presentPermission(permission.name).action}
                                disabled={disabled}
                                checked={value.includes(permission.id)}
                                onChange={event => onChange(event.target.checked
                                    ? [...value, permission.id]
                                    : value.filter(id => id !== permission.id))}
                            />
                        ))}
                    </div>
                </fieldset>
            ))}
        </div>
    )
}
