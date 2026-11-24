import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormActions } from "@/shared/component/formActions.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { FileCheck2 } from "lucide-react"
import { cdpFormSchema } from "@/features/cdps/schema/cdp.schema"
import type { CdpFormInput } from "@/features/cdps/schema/cdp.schema"
import { createCdpApi, updateCdpApi, getCdpApi } from "@/features/cdps/api/cdp.api"
import { listFincasApi } from "@/features/farms/api/finca.api"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { Combobox } from "@/shared/component/combobox.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"

export function CdpFormView() {
    const { id } = useParams()
    const isEditMode = Boolean(id)
    const cdpId = id ? Number(id) : undefined
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const cdpQuery = useQuery({
        queryKey: ["cdps", cdpId],
        queryFn: () => getCdpApi(cdpId!),
        enabled: isEditMode,
    })

    const fincasQuery = useQuery({ queryKey: ["farms"], queryFn: listFincasApi })

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CdpFormInput>({
        resolver: zodResolver(cdpFormSchema),
        defaultValues: { name: "", fincaId: "" },
        values: cdpQuery.data
            ? { name: cdpQuery.data.data.name, fincaId: String(cdpQuery.data.data.fincaId) }
            : undefined,
    })

    const saveMutation = useMutation({
        mutationFn: (formData: CdpFormInput) => {
            const payload = { name: formData.name, fincaId: Number(formData.fincaId) }
            return isEditMode && cdpId ? updateCdpApi({ id: cdpId, ...payload }) : createCdpApi(payload)
        },
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["cdps"] })
            navigate("/cdps")
        },
        onError: (error) => toast.error(error.message),
    })

    const onSubmit = handleSubmit((formData) => {
        saveMutation.mutate(formData)
    })

    const isPending = saveMutation.isPending
    const fincas = fincasQuery.data?.data ?? []
    const nameError = obtenerMensajeErrorCampo(errors.name)
    const fincaIdError = obtenerMensajeErrorCampo(errors.fincaId)

    return (
        <PageContainer size="form">
            <PageHeader icon={FileCheck2} title={isEditMode ? "Editar CDP" : "Nuevo CDP"} description={isEditMode ? "Actualiza el CDP" : "Registra un nuevo CDP"} />

            <FormPanel onSubmit={onSubmit}>
                <FormField label="Nombre de CDP" htmlFor="name" error={nameError}>
                    <Input
                        id="name"
                        placeholder="Ej. CDP-0001"
                        hasError={!!nameError}
                        disabled={isPending}
                        {...register("name")}
                    />
                </FormField>

                <FormField label="Finca" htmlFor="fincaId" error={fincaIdError}>
                    <Controller name="fincaId" control={control} render={({ field }) => <Combobox
                        id="fincaId" value={field.value ? Number(field.value) : null}
                        onChange={value => field.onChange(value == null ? "" : String(value))}
                        options={fincas.map(finca => ({ value: finca.id, label: finca.name }))}
                        placeholder="Escribe o selecciona una finca" emptyMessage="No se encontraron fincas"
                        hasError={!!fincaIdError} disabled={isPending} loading={fincasQuery.isLoading} searchInField
                    />} />
                </FormField>

                <FormActions onCancel={() => navigate("/cdps")} isPending={isPending} />
            </FormPanel>
        </PageContainer>
    )
}
