import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormActions } from "@/shared/component/formActions.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CarFront } from "lucide-react"
import { plateFormSchema } from "@/features/plates/schema/plate.schema"
import type { PlateFormInput } from "@/features/plates/schema/plate.schema"
import { createPlateApi, updatePlateApi, getPlateApi } from "@/features/plates/api/plate.api"
import { listCarriersApi } from "@/features/carriers/api/carrier.api"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { Combobox } from "@/shared/component/combobox.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"

export function PlateFormView() {
    const { id } = useParams()
    const isEditMode = Boolean(id)
    const plateId = id ? Number(id) : undefined
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const plateQuery = useQuery({
        queryKey: ["plates", plateId],
        queryFn: () => getPlateApi(plateId!),
        enabled: isEditMode,
    })

    const carriersQuery = useQuery({
        queryKey: ["carriers"],
        queryFn: () => listCarriersApi(),
    })

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<PlateFormInput>({
        resolver: zodResolver(plateFormSchema),
        defaultValues: { name: "", carrierId: "", maxGrossWeight: NaN },
        values: plateQuery.data
            ? { name: plateQuery.data.data.name, carrierId: String(plateQuery.data.data.carrierId), maxGrossWeight: plateQuery.data.data.maxGrossWeight ?? NaN }
            : undefined,
    })

    const saveMutation = useMutation({
        mutationFn: (formData: PlateFormInput) => {
            const payload = { name: formData.name, carrierId: Number(formData.carrierId), maxGrossWeight: formData.maxGrossWeight }
            return isEditMode && plateId ? updatePlateApi({ id: plateId, ...payload }) : createPlateApi(payload)
        },
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["plates"] })
            queryClient.invalidateQueries({ queryKey: ["rm-receptions"] })
            navigate("/placas")
        },
        onError: (error) => toast.error(error.message),
    })

    const onSubmit = handleSubmit((formData) => {
        saveMutation.mutate(formData)
    })

    const isPending = saveMutation.isPending
    const carriers = carriersQuery.data?.data ?? []

    const nameError = obtenerMensajeErrorCampo(errors.name)
    const carrierIdError = obtenerMensajeErrorCampo(errors.carrierId)
    const maxGrossWeightError = obtenerMensajeErrorCampo(errors.maxGrossWeight)

    return (
        <PageContainer size="form">
            <PageHeader icon={CarFront} title={isEditMode ? "Editar placa" : "Nueva placa"} description={isEditMode ? "Actualiza la información de la placa" : "Registra una nueva placa"} />

            <FormPanel noValidate onSubmit={onSubmit}>
                <FormField label="Placa" htmlFor="name" error={nameError}>
                    <Input
                        id="name"
                        placeholder="Ej. P-123ABC"
                        hasError={!!nameError}
                        disabled={isPending}
                        {...register("name")}
                    />
                </FormField>

                <FormField label="Transportista" htmlFor="carrierId" error={carrierIdError}>
                    <Controller name="carrierId" control={control} render={({ field }) => <Combobox
                        id="carrierId" value={field.value ? Number(field.value) : null}
                        onChange={value => field.onChange(value == null ? "" : String(value))}
                        options={carriers.map(carrier => ({ value: carrier.id, label: carrier.name }))}
                        placeholder="Selecciona un transportista" emptyMessage="No se encontraron transportistas"
                        hasError={!!carrierIdError} disabled={isPending}
                    />} />
                </FormField>

                <FormField label="Peso bruto máximo del camión (lb)" htmlFor="maxGrossWeight" required error={maxGrossWeightError}>
                    <Input id="maxGrossWeight" type="number" inputMode="decimal" step="any" min={Number.MIN_VALUE}
                        placeholder="Ingresa el máximo permitido" hasError={!!maxGrossWeightError} disabled={isPending}
                        {...register("maxGrossWeight", { valueAsNumber: true })} />
                </FormField>

                <FormActions onCancel={() => navigate("/placas")} isPending={isPending} />
            </FormPanel>
        </PageContainer>
    )
}
