import { PageContainer } from "@/shared/component/pageContainer.component"
import { ProductDefectsEditor } from "../component/ProductDefectsEditor"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { FormActions } from "@/shared/component/formActions.component"
import { FormPanel } from "@/shared/component/formPanel.component"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Package } from "lucide-react"
import { productFormSchema } from "@/features/products/schema/product.schema"
import type { ProductFormInput } from "@/features/products/schema/product.schema"
import { createProductApi, updateProductApi, getProductApi, toggleProductEstadoApi } from "@/features/products/api/product.api"
import { Badge } from "@/shared/component/badge.component"
import { Card } from "@/shared/component/card.component"
import { StatusAction } from "@/shared/component/statusAction.component"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { listVarietyProductsApi } from "@/features/varietyProducts/api/varietyProduct.api"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { Combobox } from "@/shared/component/combobox.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"
import { Checkbox } from "@/shared/component/checkbox.component"

export function ProductFormView() {
    const { id } = useParams()
    const isEditMode = Boolean(id)
    const productId = id ? Number(id) : undefined
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useAuthentication()
    const canEdit = user?.permissions.includes("products:edit") ?? false

    const productQuery = useQuery({
        queryKey: ["products", productId],
        queryFn: () => getProductApi(productId!),
        enabled: isEditMode,
    })

    const varietyProductsQuery = useQuery({
        queryKey: ["variety-products"],
        queryFn: () => listVarietyProductsApi(),
    })

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productFormSchema),
        mode: "onTouched",
        defaultValues: { name: "", varietyProductId: "", acceptedPercentage: NaN, evaluatePests: false, defects: [] },
        values: productQuery.data
            ? {
                  name: productQuery.data.data.name,
                  varietyProductId: String(productQuery.data.data.varietyProductId),
                  acceptedPercentage: productQuery.data.data.acceptedPercentage,
                  evaluatePests: productQuery.data.data.evaluatePests ?? false,
                  defects: productQuery.data.data.defects ?? [],
              }
            : undefined,
    })

    const saveMutation = useMutation({
        mutationFn: (formData: ProductFormInput) => {
            const payload = {
                name: formData.name,
                varietyProductId: Number(formData.varietyProductId),
                acceptedPercentage: formData.acceptedPercentage,
                evaluatePests: formData.evaluatePests ?? false,
                defects: formData.defects,
            }
            return isEditMode && productId ? updateProductApi({ id: productId, ...payload }) : createProductApi(payload)
        },
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.invalidateQueries({ queryKey: ["products"] })
            navigate("/productos")
        },
        onError: (error) => toast.error(error.message),
    })

    const onSubmit = handleSubmit((formData) => {
        saveMutation.mutate(formData)
    })

    const statusMutation = useMutation({
        mutationFn: toggleProductEstadoApi,
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            queryClient.setQueryData(["products", productId], { data: result.data })
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
        onError: (error) => toast.error(error.message),
    })

    const isPending = saveMutation.isPending || statusMutation.isPending
    const varietyProducts = varietyProductsQuery.data?.data ?? []

    const nameError = obtenerMensajeErrorCampo(errors.name)
    const varietyProductIdError = obtenerMensajeErrorCampo(errors.varietyProductId)
    const acceptedPercentageError = obtenerMensajeErrorCampo(errors.acceptedPercentage)

    if (isEditMode && productQuery.isLoading) return <LoadingSpinner />
    if (isEditMode && (productQuery.isError || !productQuery.data)) return <p role="alert" className="text-center text-error-fg">No se pudo cargar el producto. Recarga la página antes de editarlo.</p>

    return (
        <PageContainer size="form">
            <PageHeader icon={Package} title={isEditMode ? "Editar producto" : "Nuevo producto"} description={isEditMode ? "Actualiza la información del producto" : "Registra un nuevo producto"} />

            {isEditMode && productQuery.data && (
                <Card>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="mb-2 text-sm font-semibold">Estado del producto</h2>
                            <Badge variant={productQuery.data.data.activo ? "exito" : "error"}>
                                {productQuery.data.data.activo ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                        {canEdit && <StatusAction
                            active={productQuery.data.data.activo}
                            name={productQuery.data.data.name}
                            disabled={isPending}
                            onChange={activo => statusMutation.mutate({ id: productId!, activo })}
                        />}
                    </div>
                    <p className="mt-3 text-sm text-text-tertiary">
                        Al desactivarlo dejará de estar disponible para nuevas boletas. Los registros anteriores se conservan.
                    </p>
                </Card>
            )}

            <FormPanel onSubmit={onSubmit} noValidate>
                <FormField label="Nombre" htmlFor="name" error={nameError}>
                    <Input
                        id="name"
                        placeholder="Ej. Ejote Francés"
                        hasError={!!nameError}
                        disabled={isPending}
                        {...register("name")}
                    />
                </FormField>

                <FormField label="Variedad" htmlFor="varietyProductId" error={varietyProductIdError}>
                    <Controller
                        name="varietyProductId"
                        control={control}
                        render={({ field }) => (
                            <Combobox
                                id="varietyProductId"
                                value={field.value ? Number(field.value) : null}
                                onChange={(value) => field.onChange(value === null ? "" : String(value))}
                                options={varietyProducts.map((variety) => ({ value: variety.id, label: variety.name }))}
                                placeholder="Busca y selecciona una variedad"
                                emptyMessage="No se encontraron variedades"
                                loading={varietyProductsQuery.isLoading}
                                hasError={!!varietyProductIdError}
                                disabled={isPending}
                            />
                        )}
                    />
                </FormField>

                <FormField label="Porcentaje aceptado" htmlFor="acceptedPercentage" error={acceptedPercentageError}>
                    <Input
                        id="acceptedPercentage"
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min={0}
                        max={100}
                        placeholder="Mayor que 0 y hasta 100"
                        aria-invalid={!!acceptedPercentageError}
                        hasError={!!acceptedPercentageError}
                        disabled={isPending}
                        {...register("acceptedPercentage", { valueAsNumber: true })}
                    />
                </FormField>

                <div className="mb-6 rounded-xl border border-border-light p-4">
                    <Checkbox id="evaluatePests" label="Evaluar gusanos y áfidos" disabled={isPending} {...register("evaluatePests")} />
                    <p className="mt-2 text-sm text-text-tertiary">Criterio de brócoli: muestras de 11, 22, 44 y 66 lb según las canastas recibidas en planta. Para más de 500 canastas se revisan 66 lb, con consignación desde 11 gusanos o 3 cabezas con áfidos. Se evalúan conteos separados del porcentaje de calidad.</p>
                </div>
                <ProductDefectsEditor control={control} errors={errors} disabled={isPending} />
                <FormActions onCancel={() => navigate("/productos")} isPending={isPending} />
            </FormPanel>
        </PageContainer>
    )
}
