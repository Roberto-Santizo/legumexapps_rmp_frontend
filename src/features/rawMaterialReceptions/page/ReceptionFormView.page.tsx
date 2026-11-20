import { includeHistoricalOption } from "../utils/historicalOption"
import { ReviewBeforeSigning } from "../component/ReviewBeforeSigning"
import { ReceptionDifferenceWarning } from "../component/ReceptionDifferenceWarning"
import { hasLargeReceptionDifference } from "../utils/receptionDifference"
import { formatDecimal } from "@/shared/utils/formatDecimal"
import { FormActions } from "@/shared/component/formActions.component"
import { GrossWeightWarning } from "@/features/rawMaterialReceptions/component/GrossWeightWarning"
import { truckGrossWeightError } from "../utils/truckWeight"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { useMemo, useEffect, useState, useRef } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PackageCheck, TriangleAlert } from "lucide-react"
import { createReceptionFormSchema } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import type { ReceptionFormInput } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import { getRmReceptionApi, completeReceptionApi, editReceptionApi } from "@/features/rawMaterialReceptions/api/rmReception.api"
import { EditNotice } from "../component/EditNotice"
import { EditReasonModal } from "../component/EditReasonModal"
import { canEditStage, canMutateReceipt } from "../utils/editPolicy"
import { listProductsApi } from "@/features/products/api/product.api"
import { listBasketsApi } from "@/features/baskets/api/basket.api"
import { Card } from "@/shared/component/card.component"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { Combobox } from "@/shared/component/combobox.component"
import { SignaturePad } from "@/shared/component/signaturePad.component"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { getCurrentPlantApi } from "@/features/plants/api/plant.api"

const UMBRAL_ADVERTENCIA = 50000
type ReceptionSubmission = { values: ReceptionFormInput; expectedVersion?: number; reason?: string }

function formatNumero(value: number | null): string {
    return value !== null && Number.isFinite(value) ? value.toFixed(2) : "—"
}

export function ReceptionFormView({ editing = false }: { editing?: boolean }) {
    const { id } = useParams()
    const rmReceptionId = Number(id)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useAuthentication()
    const [reviewedKey, setReviewedKey] = useState("")
    const [pendingEdit, setPendingEdit] = useState<ReceptionSubmission | null>(null)

    const boletaQuery = useQuery({
        queryKey: ["rm-receptions", rmReceptionId],
        queryFn: () => getRmReceptionApi(rmReceptionId),
        refetchOnWindowFocus: false,
    })

    const productsQuery = useQuery({ queryKey: ["products"], queryFn: () => listProductsApi() })
    const basketsQuery = useQuery({ queryKey: ["baskets"], queryFn: () => listBasketsApi() })
    const plantQuery = useQuery({ queryKey: ["current-plant"], queryFn: getCurrentPlantApi, enabled: !editing, staleTime: 0 })
    const receptionPlant = editing ? boletaQuery.data?.data.plant : plantQuery.data?.data
    const missingPlant = !editing && (!receptionPlant || plantQuery.isError || plantQuery.isFetching)

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(createReceptionFormSchema(editing)),
        mode: "onTouched",
        defaultValues: {
            productId: null,
            basketId: null,
            receptorSignature: null,
        },
    })

    const originalVersion = useRef<number | null>(null)
    const boleta = boletaQuery.data?.data
    const detalleCampo = boleta?.fieldDataReceptions[0]
    const fieldProductId = detalleCampo?.product.id ?? null

    useEffect(() => {
        const plant = boleta?.prodDataReceptions[0]
        if (!editing || !plant || isDirty) return
        originalVersion.current = boleta.editVersion
        reset({ productId: fieldProductId, basketId: plant.basket.id, totalBaskets: plant.totalBaskets,
            grossWeight: plant.grossWeight, receptorSignature: plant.receptorSignature })
    }, [boleta, editing, fieldProductId, reset, isDirty])

    const productId = watch("productId")
    const totalBasketsValue = watch("totalBaskets")
    const basketIdValue = watch("basketId")
    const grossWeightValue = watch("grossWeight")

    const productMismatch = productId !== null && fieldProductId !== null && productId !== fieldProductId

    const selectedBasket = useMemo(
        () => basketsQuery.data?.data.find((basket) => basket.id === basketIdValue) ?? (editing && boleta?.prodDataReceptions[0]?.basket.id === basketIdValue ? boleta.prodDataReceptions[0].basket : null),
        [basketsQuery.data, basketIdValue, boleta, editing]
    )
    const originalPlant = editing ? boleta?.prodDataReceptions[0] : undefined
    const tara = originalPlant && basketIdValue === originalPlant.basket.id && totalBasketsValue === originalPlant.totalBaskets ? originalPlant.weightBaskets
        : selectedBasket && Number.isFinite(totalBasketsValue) ? selectedBasket.weight * totalBasketsValue : null
    const netWeight = Number.isFinite(grossWeightValue) && tara !== null ? grossWeightValue - tara : null

    const reviewKey = JSON.stringify([productId, basketIdValue, grossWeightValue, totalBasketsValue, tara, detalleCampo?.producer.id, detalleCampo?.netWeight])
    const reviewed = reviewedKey === reviewKey
    const reviewPending = hasLargeReceptionDifference(detalleCampo?.netWeight, netWeight) && !reviewed
    const invalidWeight = netWeight !== null && netWeight < 0
    const validateTruckWeight = !!detalleCampo && (!editing || grossWeightValue !== originalPlant?.grossWeight)
    const truckWeightError = validateTruckWeight ? (detalleCampo.plate
        ? truckGrossWeightError(detalleCampo.plate, grossWeightValue)
        : "La recepción no tiene una placa válida para comprobar el peso bruto.") : null

    const montosMuyAltos = Number.isFinite(totalBasketsValue) && totalBasketsValue >= UMBRAL_ADVERTENCIA

    const saveMutation = useMutation({
        mutationFn: ({ values: formData, reason = "", expectedVersion }: ReceptionSubmission) => {
            const payload = {
                productId: formData.productId!,
                basketId: formData.basketId!,
                totalBaskets: formData.totalBaskets,
                grossWeight: formData.grossWeight,
                receptorSignature: formData.receptorSignature!,
            }
            const { receptorSignature: _receptorSignature, ...editablePayload } = payload
            return editing ? editReceptionApi(rmReceptionId, { ...editablePayload, reason, expectedVersion: expectedVersion!,
            }) : completeReceptionApi({ id: rmReceptionId, ...payload })
        },
        onSuccess: (result) => {
            if (!result) return
            toast.success(result.message)
            void Promise.all([queryClient.invalidateQueries({ queryKey: ["rm-receptions"] }), queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] }), queryClient.invalidateQueries({ queryKey: ["reception-history"] }), queryClient.invalidateQueries({ queryKey: ["quality-evaluation"] })])
            navigate("/boletas")
        },
        onError: (error) => toast.error(error.message),
    })

    const onSubmit = handleSubmit((formData) => {
        if (productMismatch || saveMutation.isPending || missingPlant) return
        if (truckWeightError) { toast.error(truckWeightError); return }
        if (invalidWeight) { toast.error("El peso bruto no puede ser menor que la tara."); return }
        if (reviewPending) { toast.error("Revisa y confirma los datos antes de firmar y guardar."); return }
        if (editing) setPendingEdit({ values: formData, expectedVersion: originalVersion.current ?? boleta!.editVersion })
        else saveMutation.mutate({ values: formData })
    })

    const isPending = saveMutation.isPending
    const productOptions = useMemo(
        () =>
            includeHistoricalOption((productsQuery.data?.data ?? []).map((product) => ({
                value: product.id,
                label: product.name,
                description:
                    product.varietyProduct && product.varietyProduct.name !== product.name
                        ? `(${product.varietyProduct.name})`
                        : undefined,
            })), detalleCampo && { value: detalleCampo.product.id, label: detalleCampo.product.name, description: detalleCampo.product.varietyProduct?.name }),
        [productsQuery.data, detalleCampo]
    )
    const basketOptions = useMemo(
        () => includeHistoricalOption((basketsQuery.data?.data ?? []).map((basket) => ({ value: basket.id, label: basket.name, description: `${formatDecimal(basket.weight)} lb` })), originalPlant && { value: originalPlant.basket.id, label: originalPlant.basket.name }),
        [basketsQuery.data, originalPlant]
    )

    const productError = productMismatch
        ? "El producto no coincide con el registrado en campo. Verifica bien el producto y corrígelo antes de continuar."
        : errors.productId?.message
    const totalBasketsError = obtenerMensajeErrorCampo(errors.totalBaskets)
    const basketError = errors.basketId?.message
    const grossWeightError = obtenerMensajeErrorCampo(errors.grossWeight)
    const receptorSignatureError = errors.receptorSignature?.message

    const camposBloqueados = isPending || productMismatch || !boleta || missingPlant

    if (boletaQuery.isLoading) return <LoadingSpinner />
    if (boletaQuery.isError || !boleta)
        return (
            <p className="text-center text-error-fg">
                {boletaQuery.error?.message ?? "No se pudo cargar la boleta."}
            </p>
        )

    if (!canMutateReceipt(boleta, user) || (editing ? !canEditStage(boleta, "reception", user?.permissions ?? []) || !boleta.prodDataReceptions[0] : !user?.permissions.includes("rawMaterialReceptions:receive"))) return <Navigate to="/403" replace />

    if (!editing && boleta.status !== "pendiente_recepcion") {
        return (
            <div className="mx-auto max-w-2xl space-y-4 text-center">
                <p className="text-error-fg">Esta boleta no está pendiente de recepción.</p>
                <Link to="/boletas" className="text-sm font-semibold text-primary-dark underline">
                    Volver a boletas
                </Link>
            </div>
        )
    }

    return (
        <PageContainer size="form" className="pb-10">
            <PageHeader icon={PackageCheck} title={editing ? "Corregir recepción en planta" : "Recepción en planta"} description={<>Boleta #{rmReceptionId.toString().padStart(6, "0")}</>} />
            <div className="mb-5 rounded-xl border border-border-light bg-bg-primary p-4">
                {receptionPlant ? <p className="font-semibold text-dark">Planta de recepción: {receptionPlant.name} · {receptionPlant.code}00</p>
                    : !editing && plantQuery.isLoading ? <p>Cargando planta de recepción...</p>
                    : <p role="alert" className="text-error-fg">{plantQuery.error?.message ?? (editing ? "Esta boleta anterior aún no tiene planta asignada." : "Tu usuario no tiene planta asignada. Solicita su asignación antes de registrar la recepción.")}</p>}
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {editing && <EditNotice count={boleta.receptionEditCount} override={user?.permissions.includes("rawMaterialReceptions:overrideEdit") ?? false} />}
                <Card>
                    <FormField label="Producto" htmlFor="productId" error={productError}>
                        <Controller
                            control={control}
                            name="productId"
                            render={({ field }) => (
                                <Combobox
                                    id="productId"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={productOptions}
                                    loading={productsQuery.isLoading}
                                    hasError={!!productError}
                                    disabled={isPending}
                                    placeholder="Selecciona el producto recibido"
                                />
                            )}
                        />
                    </FormField>

                    <FormField label="Cantidad de canastas" htmlFor="totalBaskets" error={totalBasketsError}>
                        <Input
                            id="totalBaskets"
                            required
                            type="number"
                            inputMode="numeric"
                            step="1"
                            min={1}
                            placeholder="0"
                            hasError={!!totalBasketsError}
                            disabled={camposBloqueados}
                            {...register("totalBaskets", { valueAsNumber: true })}
                        />
                    </FormField>

                    <FormField label="Tipo de canasta (en planta)" htmlFor="basketId" error={basketError}>
                        <Controller
                            control={control}
                            name="basketId"
                            render={({ field }) => (
                                <Combobox
                                    id="basketId"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={basketOptions}
                                    loading={basketsQuery.isLoading}
                                    hasError={!!basketError}
                                    disabled={camposBloqueados}
                                    placeholder="Selecciona el tipo de canasta usado en planta"
                                />
                            )}
                        />
                    </FormField>

                    <FormField label="Peso bruto (lb)" htmlFor="grossWeight" error={grossWeightError}>
                        <Input
                            id="grossWeight"
                            required
                            aria-describedby="plant-gross-weight-warning"
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min={Number.MIN_VALUE}
                            placeholder="0.00"
                            hasError={!!grossWeightError || !!truckWeightError}
                            disabled={camposBloqueados}
                            {...register("grossWeight", { valueAsNumber: true })}
                        />
                        <GrossWeightWarning id="plant-gross-weight-warning" value={grossWeightValue} plate={detalleCampo?.plate} validate={validateTruckWeight} />
                        {truckWeightError && !detalleCampo?.plate && <p role="alert" className="mt-2 text-sm text-error-fg">{truckWeightError}</p>}
                        {invalidWeight && <p role="alert" className="mt-2 text-sm text-error-fg">El peso bruto no puede ser menor que la tara.</p>}
                    </FormField>

                    {montosMuyAltos && (
                        <div className="mb-5 flex items-start gap-2 rounded-[10px] border-[1.5px] border-aviso-bd bg-aviso-bg px-4 py-3">
                            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-aviso-fg" />
                            <p className="text-sm text-aviso-fg">
                                Cuidado, verifica bien tus datos: están muy altos. Si tu información es correcta no hay
                                problema.
                            </p>
                        </div>
                    )}

                    <div className="rounded-[10px] border-[1.5px] border-border-light bg-bg-primary p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                            Resultados calculados
                        </p>
                        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs text-text-tertiary">Tara (lb)</dt>
                                <dd className="text-lg font-semibold text-dark">{formatNumero(tara)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-tertiary">Peso neto (lb)</dt>
                                <dd className="text-lg font-semibold text-dark">{formatNumero(netWeight)}</dd>
                            </div>
                        </dl>
                    </div>
                </Card>

                <Card>
                    <ReceptionDifferenceWarning fieldNetWeight={detalleCampo?.netWeight} plantNetWeight={netWeight} />
                    <ReviewBeforeSigning producer={detalleCampo?.producer.name}
                        product={productsQuery.data?.data.find(item => item.id === productId)?.name ?? detalleCampo?.product.name}
                        gross={grossWeightValue} baskets={totalBasketsValue} tare={tara} net={netWeight} confirmed={reviewed}
                        onConfirm={value => setReviewedKey(value ? reviewKey : "")} disabled={camposBloqueados || productMismatch || !!truckWeightError}
                        requireConfirmation={hasLargeReceptionDifference(detalleCampo?.netWeight, netWeight)} />
                    {!editing && <FormField label="Firma de receptor" htmlFor="receptorSignature" error={receptorSignatureError}>
                        <Controller
                            control={control}
                            name="receptorSignature"
                            render={({ field }) => (
                                <SignaturePad
                                    readOnly={editing}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={camposBloqueados || reviewPending || invalidWeight || !!truckWeightError || tara === null}
                                    hasError={!!receptorSignatureError}
                                />
                            )}
                        />
                        <p className="mt-3 text-center text-sm font-semibold text-dark">{editing && !watch("receptorSignature")?.startsWith("data:") ? boleta.prodDataReceptions[0]?.receptorName : user?.name}</p>
                    </FormField>}

                </Card>

                <FormActions onCancel={() => navigate("/boletas")} isPending={isPending} submitLabel={editing ? "Guardar corrección de recepción" : "Completar recepción"} submitDisabled={camposBloqueados || reviewPending || invalidWeight || !!truckWeightError || tara === null || (!editing && !watch("receptorSignature")?.trim())} />
            </form>
            {pendingEdit && <EditReasonModal isPending={isPending} error={saveMutation.error?.message}
                onCancel={() => { setPendingEdit(null); saveMutation.reset() }}
                onConfirm={reason => saveMutation.mutate({ ...pendingEdit, reason })} />}
        </PageContainer>
    )
}
