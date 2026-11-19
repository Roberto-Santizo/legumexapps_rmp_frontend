import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { UserRound } from "lucide-react"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { FormActions } from "@/shared/component/formActions.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"
import { producerFormSchema } from "../schema/producer.schema"
import type { ProducerFormInput } from "../schema/producer.schema"
import { createProducerApi, getProducerApi, updateProducerApi } from "../api/producer.api"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { Button } from "@/shared/component/button.component"

export function ProducerFormView() {
    const { id } = useParams()
    const isEditMode = id !== undefined
    const producerId = Number(id)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const producerQuery = useQuery({
        queryKey: ["producers", producerId], queryFn: () => getProducerApi(producerId),
        enabled: isEditMode, refetchOnWindowFocus: false,
    })
    const { register, handleSubmit, formState: { errors } } = useForm<ProducerFormInput>({
        resolver: zodResolver(producerFormSchema),
        defaultValues: { code: "", name: "" },
        values: isEditMode && producerQuery.data ? { code: producerQuery.data.data.code, name: producerQuery.data.data.name } : undefined,
    })
    const saveMutation = useMutation({
        mutationFn: (data: ProducerFormInput) => isEditMode ? updateProducerApi({ id: producerId, ...data }) : createProducerApi(data),
        onSuccess: async result => {
            if (!result) return
            toast.success(result.message)
            await queryClient.invalidateQueries({ queryKey: ["producers"] })
            navigate("/productores")
        },
        onError: error => toast.error(error.message),
    })
    const isPending = saveMutation.isPending
    const codeError = obtenerMensajeErrorCampo(errors.code)
    const nameError = obtenerMensajeErrorCampo(errors.name)

    if (isEditMode && producerQuery.isLoading) return <LoadingSpinner />
    if (isEditMode && producerQuery.isError) return <PageContainer size="form">
        <p role="alert" className="mb-6 text-error-fg">{producerQuery.error.message}</p>
        <Button variant="secondary" onClick={() => navigate("/productores")}>Volver al listado</Button>
    </PageContainer>

    return <PageContainer size="form">
        <PageHeader icon={UserRound} title={isEditMode ? "Editar productor" : "Nuevo productor"} description={isEditMode ? "Actualiza el código y nombre del productor." : "Registra el código y nombre del productor para utilizarlo en las boletas de materia prima."} />
        <FormPanel onSubmit={handleSubmit(data => { if (!isPending) saveMutation.mutate(data) })}>
            <FormField label="Código del productor" htmlFor="producer-code" required error={codeError}>
                <Input id="producer-code" placeholder="Ej. PRO-000311" maxLength={255} aria-required="true" hasError={!!codeError} disabled={isPending} {...register("code")} />
            </FormField>
            <FormField label="Nombre del productor" htmlFor="producer-name" required error={nameError}>
                <Input id="producer-name" placeholder="Nombre completo del productor" maxLength={255} aria-required="true" hasError={!!nameError} disabled={isPending} {...register("name")} />
            </FormField>
            <FormActions onCancel={() => navigate("/productores")} isPending={isPending} submitLabel={isEditMode ? "Guardar cambios" : "Guardar productor"} />
        </FormPanel>
    </PageContainer>
}
