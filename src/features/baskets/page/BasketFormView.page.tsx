import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormActions } from "@/shared/component/formActions.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PackageOpen } from "lucide-react"
import { basketFormSchema } from "@/features/baskets/schema/basket.schema"
import type { BasketFormInput } from "@/features/baskets/schema/basket.schema"
import { createBasketApi, updateBasketApi, getBasketApi } from "@/features/baskets/api/basket.api"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"

export function BasketFormView() {
    const { id } = useParams()
    const isEditMode = Boolean(id)
    const basketId = id ? Number(id) : undefined
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const basketQuery = useQuery({
        queryKey: ["baskets", basketId],
        queryFn: () => getBasketApi(basketId!),
        enabled: isEditMode,
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(basketFormSchema),
        defaultValues: { code: "", weight: 0 },
        values: basketQuery.data ? { code: basketQuery.data.data.code, weight: basketQuery.data.data.weight } : undefined,
    })

    const saveMutation = useMutation({
        mutationFn: (formData: BasketFormInput) =>
            isEditMode && basketId ? updateBasketApi({ id: basketId, ...formData }) : createBasketApi(formData),
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["baskets"] })
            navigate("/canastas")
        },
        onError: (error) => toast.error(error.message),
    })

    const onSubmit = handleSubmit((formData) => {
        saveMutation.mutate(formData)
    })

    const isPending = saveMutation.isPending
    const codeError = obtenerMensajeErrorCampo(errors.code)
    const weightError = obtenerMensajeErrorCampo(errors.weight)

    return (
        <PageContainer size="form">
            <PageHeader icon={PackageOpen} title={isEditMode ? "Editar canasta" : "Nueva canasta"} description={isEditMode ? "Actualiza el tipo de canasta" : "Registra un nuevo tipo de canasta"} />

            <FormPanel onSubmit={onSubmit}>
                <FormField label="Código" htmlFor="code" error={codeError}>
                    <Input
                        id="code"
                        placeholder="Ej. CAN-PLASTICA-20"
                        hasError={!!codeError}
                        disabled={isPending}
                        {...register("code")}
                    />
                </FormField>

                <FormField label="Peso en libras" htmlFor="weight" error={weightError}>
                    <Input
                        id="weight"
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="0.00"
                        hasError={!!weightError}
                        disabled={isPending}
                        {...register("weight", { valueAsNumber: true })}
                    />
                </FormField>

                <FormActions onCancel={() => navigate("/canastas")} isPending={isPending} />
            </FormPanel>
        </PageContainer>
    )
}
