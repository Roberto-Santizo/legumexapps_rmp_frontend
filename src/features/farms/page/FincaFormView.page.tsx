import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Sprout } from "lucide-react"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { FormActions } from "@/shared/component/formActions.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"
import { fincaFormSchema } from "../schema/finca.schema"
import type { FincaFormInput } from "../schema/finca.schema"
import { createFincaApi, getFincaApi, updateFincaApi } from "../api/finca.api"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { Button } from "@/shared/component/button.component"

export function FincaFormView() {
    const { id } = useParams()
    const isEditMode = id !== undefined
    const fincaId = Number(id)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const fincaQuery = useQuery({
        queryKey: ["farms", fincaId], queryFn: () => getFincaApi(fincaId),
        enabled: isEditMode, refetchOnWindowFocus: false,
    })
    const { register, handleSubmit, formState: { errors } } = useForm<FincaFormInput>({
        resolver: zodResolver(fincaFormSchema),
        defaultValues: { name: "" },
        values: isEditMode && fincaQuery.data ? { name: fincaQuery.data.data.name } : undefined,
    })
    const saveMutation = useMutation({
        mutationFn: (data: FincaFormInput) => isEditMode ? updateFincaApi({ id: fincaId, ...data }) : createFincaApi(data),
        onSuccess: async result => {
            if (!result) return
            toast.success(result.message)
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["farms"] }), queryClient.invalidateQueries({ queryKey: ["cdps"] })])
            navigate("/fincas")
        },
        onError: error => toast.error(error.message),
    })
    const isPending = saveMutation.isPending
    const nameError = obtenerMensajeErrorCampo(errors.name)

    if (isEditMode && fincaQuery.isLoading) return <LoadingSpinner />
    if (isEditMode && fincaQuery.isError) return <PageContainer size="form">
        <p role="alert" className="mb-6 text-error-fg">{fincaQuery.error.message}</p>
        <Button variant="secondary" onClick={() => navigate("/fincas")}>Volver al listado</Button>
    </PageContainer>

    return <PageContainer size="form">
        <PageHeader icon={Sprout} title={isEditMode ? "Editar finca" : "Nueva finca"} description={isEditMode ? "Actualiza el nombre de la finca." : "Registra los datos de la finca para utilizarla en las boletas de materia prima y los CDP."} />
        <FormPanel onSubmit={handleSubmit(data => { if (!isPending) saveMutation.mutate(data) })}>
            <FormField label="Nombre de finca" htmlFor="finca-name" required error={nameError}>
                <Input id="finca-name" placeholder="Ej. Las Victorias" maxLength={255} aria-required="true" hasError={!!nameError} disabled={isPending} {...register("name")} />
            </FormField>
            <FormActions onCancel={() => navigate("/fincas")} isPending={isPending} submitLabel={isEditMode ? "Guardar cambios" : "Guardar finca"} />
        </FormPanel>
    </PageContainer>
}
