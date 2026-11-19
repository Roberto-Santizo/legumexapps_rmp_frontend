import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormActions } from "@/shared/component/formActions.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Truck } from "lucide-react"
import { carrierFormSchema } from "@/features/carriers/schema/carrier.schema"
import type { CarrierFormInput } from "@/features/carriers/schema/carrier.schema"
import { createCarrierApi, updateCarrierApi, getCarrierApi, toggleCarrierEstadoApi } from "@/features/carriers/api/carrier.api"
import { Card } from "@/shared/component/card.component"
import { Badge } from "@/shared/component/badge.component"
import { StatusAction } from "@/shared/component/statusAction.component"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"

export function CarrierFormView() {
    const { id } = useParams()
    const isEditMode = Boolean(id)
    const carrierId = id ? Number(id) : undefined
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useAuthentication()
    const canEdit = user?.permissions.includes("transport:edit") ?? false

    const carrierQuery = useQuery({
        queryKey: ["carriers", carrierId],
        queryFn: () => getCarrierApi(carrierId!),
        enabled: isEditMode,
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CarrierFormInput>({
        resolver: zodResolver(carrierFormSchema),
        defaultValues: { code: "", name: "" },
        values: carrierQuery.data ? { code: carrierQuery.data.data.code, name: carrierQuery.data.data.name } : undefined,
    })

    const saveMutation = useMutation({
        mutationFn: (formData: CarrierFormInput) =>
            isEditMode && carrierId ? updateCarrierApi({ id: carrierId, ...formData }) : createCarrierApi(formData),
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["carriers"] })
            navigate("/transportistas")
        },
        onError: (error) => toast.error(error.message),
    })

    const onSubmit = handleSubmit((formData) => {
        saveMutation.mutate(formData)
    })

    const statusMutation = useMutation({
        mutationFn: toggleCarrierEstadoApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.setQueryData(["carriers", carrierId], { data: result.data })
            queryClient.invalidateQueries({ queryKey: ["carriers"] })
        },
        onError: (error) => toast.error(error.message),
    })

    const isPending = saveMutation.isPending || statusMutation.isPending
    const codeError = obtenerMensajeErrorCampo(errors.code)
    const nameError = obtenerMensajeErrorCampo(errors.name)

    return (
        <PageContainer size="form">
            <PageHeader icon={Truck} title={isEditMode ? "Editar transportista" : "Nuevo transportista"} description={isEditMode ? "Actualiza la información del transportista" : "Registra un nuevo transportista"} />

            {isEditMode && carrierQuery.data && (
                <Card>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="mb-2 text-sm font-semibold">Estado del transportista</h2>
                            <Badge variant={carrierQuery.data.data.activo ? "exito" : "error"}>
                                {carrierQuery.data.data.activo ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                        {canEdit && <StatusAction
                            active={carrierQuery.data.data.activo}
                            name={carrierQuery.data.data.name}
                            disabled={isPending}
                            onChange={activo => statusMutation.mutate({ id: carrierId!, activo })}
                        />}
                    </div>
                    <p className="mt-3 text-sm text-text-tertiary">
                        Al desactivarlo dejará de aparecer al crear nuevas boletas. Los registros anteriores se conservan.
                    </p>
                </Card>
            )}

            <FormPanel onSubmit={onSubmit}>
                <FormField label="Código" htmlFor="code" error={codeError}>
                    <Input
                        id="code"
                        placeholder="Ej. TRANS-001"
                        hasError={!!codeError}
                        disabled={isPending}
                        {...register("code")}
                    />
                </FormField>

                <FormField label="Nombre" htmlFor="name" error={nameError}>
                    <Input
                        id="name"
                        placeholder="Ej. Transportes González"
                        hasError={!!nameError}
                        disabled={isPending}
                        {...register("name")}
                    />
                </FormField>

                <FormActions onCancel={() => navigate("/transportistas")} isPending={isPending} />
            </FormPanel>
        </PageContainer>
    )
}
