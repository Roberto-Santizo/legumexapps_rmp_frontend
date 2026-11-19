import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormActions } from "@/shared/component/formActions.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Shield } from "lucide-react"
import { roleFormSchema } from "@/features/roles/schema/role.schema"
import type { RoleFormInput } from "@/features/roles/schema/role.schema"
import { createRoleApi, updateRoleApi, getRoleApi, getRolePermissionsApi, listPermissionCatalogApi } from "@/features/roles/api/role.api"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { PermissionSelector } from "../component/PermissionSelector"
import { FieldError } from "@/shared/component/fieldError.component"
import { Label } from "@/shared/component/label.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"

export function RoleFormView() {
    const { id } = useParams()
    const isEditMode = Boolean(id)
    const roleId = id ? Number(id) : undefined
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const roleQuery = useQuery({
        queryKey: ["roles", roleId],
        queryFn: () => getRoleApi(roleId!),
        enabled: isEditMode,
    })

    const rolePermissionsQuery = useQuery({
        queryKey: ["roles", roleId, "permissions"],
        queryFn: () => getRolePermissionsApi(roleId!),
        enabled: isEditMode,
    })

    const permissionsQuery = useQuery({
        queryKey: ["roles", "permission-catalog"],
        queryFn: listPermissionCatalogApi,
    })

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RoleFormInput>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: { name: "", permissionIds: [] },
        values:
            roleQuery.data && rolePermissionsQuery.data
                ? {
                      name: roleQuery.data.data.name,
                      permissionIds: rolePermissionsQuery.data.data.map((permission) => permission.id),
                  }
                : undefined,
    })

    const saveMutation = useMutation({
        mutationFn: ({ name, permissionIds }: RoleFormInput) =>
            isEditMode && roleId ? updateRoleApi({ id: roleId, name, permissionIds }) : createRoleApi({ name, permissionIds }),
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["roles"] })
            navigate("/roles")
        },
        onError: (error) => toast.error(error.message),
    })

    const selectionUnavailable = permissionsQuery.isLoading || permissionsQuery.isError || (isEditMode && (rolePermissionsQuery.isLoading || rolePermissionsQuery.isError || roleQuery.isLoading || roleQuery.isError))
    const onSubmit = handleSubmit((formData) => {
        if (!selectionUnavailable) saveMutation.mutate(formData)
    })

    const isPending = saveMutation.isPending
    const nameError = obtenerMensajeErrorCampo(errors.name)
    const permissionIdsError = errors.permissionIds?.message
    const permissions = permissionsQuery.data?.data ?? []

    return (
        <PageContainer size="form">
            <PageHeader icon={Shield} title={isEditMode ? "Editar rol" : "Nuevo rol"} description={isEditMode ? "Actualiza el rol y sus permisos" : "Define un nuevo rol y asígnale permisos"} />

            <FormPanel onSubmit={onSubmit}>
                {isEditMode && (roleQuery.isError || rolePermissionsQuery.isError) && <p role="alert" className="mb-4 text-sm text-error-fg">No se pudo cargar el rol y sus permisos. Vuelve a la lista e intenta nuevamente.</p>}
                <FormField label="Nombre" htmlFor="name" error={nameError}>
                    <Input
                        id="name"
                        placeholder="Ej. Supervisor de recepción"
                        hasError={!!nameError}
                        disabled={isPending}
                        {...register("name")}
                    />
                </FormField>

                <div className="mb-5">
                    <Label htmlFor="permissionIds">Permisos</Label>
                    <p className="mb-3 mt-2 text-xs text-text-tertiary">Selecciona las funciones que este rol puede utilizar. El catálogo lo define el sistema.</p>
                    <Controller
                        control={control}
                        name="permissionIds"
                        render={({ field }) => (
                            <PermissionSelector
                                permissions={permissions}
                                value={field.value ?? []}
                                onChange={field.onChange}
                                disabled={isPending}
                                loading={permissionsQuery.isLoading}
                                error={permissionsQuery.isError ? "No se pudieron cargar los permisos." : undefined}
                            />
                        )}
                    />
                    <FieldError>{permissionIdsError}</FieldError>
                </div>

                <FormActions onCancel={() => navigate("/roles")} isPending={isPending} submitDisabled={selectionUnavailable} />
            </FormPanel>
        </PageContainer>
    )
}
