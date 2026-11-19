import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormActions } from "@/shared/component/formActions.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { createUserFormSchema } from "@/features/users/schema/user.schema"
import type { CreateUserFormInput } from "@/features/users/schema/user.schema"
import { createUserApi } from "@/features/users/api/user.api"
import { listRolesApi } from "@/features/roles/api/role.api"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { Select } from "@/shared/component/select.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"
import { listCarriersApi } from "@/features/carriers/api/carrier.api"
import { listPlantsApi } from "@/features/plants/api/plant.api"

export function UserFormView() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showPassword, setShowPassword] = useState(false)

    const rolesQuery = useQuery({
        queryKey: ["roles"],
        queryFn: () => listRolesApi(),
    })
    const plantsQuery = useQuery({ queryKey: ["plants"], queryFn: listPlantsApi })

    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateUserFormInput>({
        resolver: zodResolver(createUserFormSchema),
        defaultValues: { name: "", username: "", password: "", confirmPassword: "", roleId: "", representedCarrierId: "", plantId: "" },
    })
    const roleId = watch("roleId")
    const isFieldRole = rolesQuery.data?.data.find(role => role.id === Number(roleId))?.name.trim().toLocaleLowerCase("es") === "campo"
    const carriersQuery = useQuery({ queryKey: ["carriers"], queryFn: () => listCarriersApi(), enabled: isFieldRole })

    const saveMutation = useMutation({
        mutationFn: ({ confirmPassword: _confirmPassword, roleId, representedCarrierId, plantId, ...formData }: CreateUserFormInput) =>
            createUserApi({ ...formData, roleId: Number(roleId), representedCarrierId: isFieldRole && representedCarrierId ? Number(representedCarrierId) : null, plantId: plantId ? Number(plantId) : null }),
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["users"] })
            navigate("/usuarios")
        },
        onError: (error) => toast.error(error.message),
    })

    const onSubmit = handleSubmit((formData) => {
        saveMutation.mutate(formData)
    })

    const isPending = saveMutation.isPending
    const roles = rolesQuery.data?.data ?? []

    const nameError = obtenerMensajeErrorCampo(errors.name)
    const usernameError = obtenerMensajeErrorCampo(errors.username)
    const passwordError = obtenerMensajeErrorCampo(errors.password)
    const confirmPasswordError = obtenerMensajeErrorCampo(errors.confirmPassword)
    const roleIdError = obtenerMensajeErrorCampo(errors.roleId)

    return (
        <PageContainer size="form">
            <PageHeader icon={UserPlus} title={<>Nuevo usuario</>} description={<>Crea una cuenta de acceso y asígnale un rol</>} />

            <FormPanel onSubmit={onSubmit}>
                <FormField label="Nombre completo" htmlFor="name" error={nameError}>
                    <Input
                        id="name"
                        placeholder="Ej. Luis González"
                        hasError={!!nameError}
                        disabled={isPending}
                        {...register("name")}
                    />
                </FormField>

                <FormField label="Usuario" htmlFor="username" error={usernameError}>
                    <Input
                        id="username"
                        placeholder="nombre.usuario"
                        autoComplete="off"
                        preserveCase
                        hasError={!!usernameError}
                        disabled={isPending}
                        {...register("username")}
                    />
                </FormField>

                <FormField label="Rol" htmlFor="roleId" error={roleIdError}>
                    <Select id="roleId" hasError={!!roleIdError} disabled={isPending} {...register("roleId")}>
                        <option value="">Selecciona un rol</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </Select>
                </FormField>

                <FormField label="Planta" htmlFor="plantId" error={plantsQuery.error?.message ?? errors.plantId?.message}>
                    <Select id="plantId" disabled={isPending || plantsQuery.isLoading || plantsQuery.isError} {...register("plantId")}>
                        <option value="">Sin planta asignada</option>
                        {(plantsQuery.data?.data ?? []).map(plant => <option key={plant.id} value={plant.id}>{plant.name} ({plant.code})</option>)}
                    </Select>
                    <p className="mt-2 text-sm text-text-tertiary">Necesaria para registrar recepciones. Determina el prefijo LP00 o LT00 de las boletas recibidas por este usuario.</p>
                </FormField>

                {isFieldRole && <FormField label="Transportista representado (opcional)" htmlFor="representedCarrierId" error={carriersQuery.error?.message ?? errors.representedCarrierId?.message}>
                    <Select id="representedCarrierId" disabled={isPending || carriersQuery.isLoading} {...register("representedCarrierId")}>
                        <option value="">Ninguno: usuario de campo normal</option>
                        {(carriersQuery.data?.data ?? []).map(carrier => <option key={carrier.id} value={carrier.id}>{carrier.name}</option>)}
                    </Select>
                    <p className="mt-2 text-sm text-text-tertiary">Solo un representante por transportista. Para consultar las boletas de sus camiones, habilita en el rol Campo el permiso «Gestionar boletas del transportista asignado».</p>
                </FormField>}

                <FormField label="Contraseña" htmlFor="password" error={passwordError}>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            preserveCase
                            hasError={!!passwordError}
                            disabled={isPending}
                            className="pr-12"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary transition hover:text-dark"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </FormField>

                <FormField label="Confirmar contraseña" htmlFor="confirmPassword" error={confirmPasswordError}>
                    <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        preserveCase
                        hasError={!!confirmPasswordError}
                        disabled={isPending}
                        {...register("confirmPassword")}
                    />
                </FormField>

                <FormActions onCancel={() => navigate("/usuarios")} isPending={isPending} />
            </FormPanel>
        </PageContainer>
    )
}
