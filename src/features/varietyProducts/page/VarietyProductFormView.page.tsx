import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormActions } from "@/shared/component/formActions.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Tag } from "lucide-react"
import { varietyProductFormSchema } from "@/features/varietyProducts/schema/varietyProduct.schema"
import type { VarietyProductFormInput } from "@/features/varietyProducts/schema/varietyProduct.schema"
import {
    createVarietyProductApi,
    updateVarietyProductApi,
    getVarietyProductApi,
} from "@/features/varietyProducts/api/varietyProduct.api"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"

export function VarietyProductFormView() {
    const { id } = useParams()
    const isEditMode = Boolean(id)
    const varietyProductId = id ? Number(id) : undefined
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const varietyProductQuery = useQuery({
        queryKey: ["variety-products", varietyProductId],
        queryFn: () => getVarietyProductApi(varietyProductId!),
        enabled: isEditMode,
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<VarietyProductFormInput>({
        resolver: zodResolver(varietyProductFormSchema),
        defaultValues: { name: "" },
        values: varietyProductQuery.data ? { name: varietyProductQuery.data.data.name } : undefined,
    })

    const saveMutation = useMutation({
        mutationFn: (formData: VarietyProductFormInput) =>
            isEditMode && varietyProductId
                ? updateVarietyProductApi({ id: varietyProductId, ...formData })
                : createVarietyProductApi(formData),
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["variety-products"] })
            navigate("/variedades")
        },
        onError: (error) => toast.error(error.message),
    })

    const onSubmit = handleSubmit((formData) => {
        saveMutation.mutate(formData)
    })

    const isPending = saveMutation.isPending
    const nameError = obtenerMensajeErrorCampo(errors.name)

    return (
        <PageContainer size="form">
            <PageHeader icon={Tag} title={isEditMode ? "Editar variedad" : "Nueva variedad"} description={isEditMode ? "Actualiza el nombre de la variedad" : "Registra una nueva variedad de producto"} />

            <FormPanel onSubmit={onSubmit}>
                <FormField label="Nombre" htmlFor="name" error={nameError}>
                    <Input
                        id="name"
                        placeholder="Ej. Ejote Francés"
                        hasError={!!nameError}
                        disabled={isPending}
                        {...register("name")}
                    />
                </FormField>

                <FormActions onCancel={() => navigate("/variedades")} isPending={isPending} />
            </FormPanel>
        </PageContainer>
    )
}
