import { includeHistoricalOption } from "../utils/historicalOption"
import { ReviewBeforeSigning } from "../component/ReviewBeforeSigning"
import { guatemalaDate, documentDateRange } from "../utils/documentDate"
import { formatDecimal } from "@/shared/utils/formatDecimal"
import { FormActions } from "@/shared/component/formActions.component"
import { GrossWeightWarning } from "@/features/rawMaterialReceptions/component/GrossWeightWarning"
import { truckGrossWeightError } from "../utils/truckWeight"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { useEffect, useMemo, useState, useRef } from "react"
import { useNavigate, useParams, Navigate } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Check } from "lucide-react"
import { Button } from "@/shared/component/button.component"
import { createBoletaFormSchema } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import type { BoletaFormInput } from "@/features/rawMaterialReceptions/schema/rmReception.schema"
import { createRmReceptionApi, getRmReceptionApi, editFieldApi } from "@/features/rawMaterialReceptions/api/rmReception.api"
import { EditNotice } from "../component/EditNotice"
import { EditReasonModal } from "../component/EditReasonModal"
import { canEditStage, canMutateReceipt } from "../utils/editPolicy"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { listProducersApi } from "@/features/producers/api/producer.api"
import { listFincasApi } from "@/features/farms/api/finca.api"
import { listCarriersApi } from "@/features/carriers/api/carrier.api"
import { listPlatesApi } from "@/features/plates/api/plate.api"
import { listProductsApi } from "@/features/products/api/product.api"
import { listBasketsApi } from "@/features/baskets/api/basket.api"
import { listCdpsApi } from "@/features/cdps/api/cdp.api"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { Card } from "@/shared/component/card.component"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { DateInput } from "@/shared/component/dateInput.component"
import { Select } from "@/shared/component/select.component"
import { Checkbox } from "@/shared/component/checkbox.component"
import { Combobox } from "@/shared/component/combobox.component"
import { SignaturePad } from "@/shared/component/signaturePad.component"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"

function SectionTitle({ children }: { children: string }) {
    return <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-dark">{children}</h2>
}

function formatNumero(value: number | null): string {
    return value !== null && Number.isFinite(value) ? value.toFixed(2) : "—"
}

type FieldSubmission = { values: BoletaFormInput; expectedVersion?: number; reason?: string }

export function BoletaFormView() {
    const { id } = useParams()
    const editing = id !== undefined
    const receptionId = Number(id)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useAuthentication()
    const carrierRepresentative = user?.role?.trim().toLocaleLowerCase("es") === "campo" && user.permissions.includes("rawMaterialReceptions:manageCarrier") && !!user.representedCarrierId
    const [dateEditable, setDateEditable] = useState(false)
    const [pilotEditable, setPilotEditable] = useState(false)
    const [reviewedKey, setReviewedKey] = useState("")
    const [pendingEdit, setPendingEdit] = useState<FieldSubmission | null>(null)
    const receiptQuery = useQuery({ queryKey: ["rm-receptions", receptionId], queryFn: () => getRmReceptionApi(receptionId), enabled: editing, refetchOnWindowFocus: false })
    const originalVersion = useRef<number | null>(null)
    const receipt = receiptQuery.data?.data

    const producersQuery = useQuery({ queryKey: ["producers"], queryFn: listProducersApi })
    const fincasQuery = useQuery({ queryKey: ["farms"], queryFn: listFincasApi })
    const productsQuery = useQuery({ queryKey: ["products"], queryFn: () => listProductsApi() })
    const basketsQuery = useQuery({ queryKey: ["baskets"], queryFn: () => listBasketsApi() })
    const cdpsQuery = useQuery({ queryKey: ["cdps"], queryFn: () => listCdpsApi() })

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(createBoletaFormSchema(receipt ? guatemalaDate(new Date(receipt.docDate)) : undefined)),
        mode: "onTouched",
        defaultValues: {
            docDate: guatemalaDate(),
            fincaId: "",
            carrierId: carrierRepresentative ? String(user!.representedCarrierId) : "",
            plateId: "",
            producerId: null,
            productId: null,
            basketId: null,
            cdpId: null,
            inspectorName: "",
            pilotName: user?.name.toUpperCase() ?? "",
            noQualityPercentage: false,
            inspectorSignature: null,
            driverSignature: null,
            prodSignature: null,
        },
    })

    useEffect(() => {
        const field = receipt?.fieldDataReceptions[0]
        if (!receipt || !field || isDirty) return
        originalVersion.current = receipt.editVersion
        reset({ docDate: guatemalaDate(new Date(receipt.docDate)), fincaId: String(receipt.finca.id), carrierId: String(field.carrier.id),
            plateId: field.plate ? String(field.plate.id) : "", producerId: field.producer.id, productId: field.product.id, basketId: field.basket.id,
            cdpId: field.cdpId, inspectorName: field.inspectorName, pilotName: field.pilotName ?? "", weight: field.weight,
            totalBaskets: field.totalBaskets, noQualityPercentage: field.qualityPercentage === null || field.qualityDefinedInPlant === true,
            qualityPercentage: field.qualityDefinedInPlant ? undefined : field.qualityPercentage ?? undefined,
            inspectorSignature: field.inspectorSignature, driverSignature: field.driverSignature, prodSignature: field.prodSignature })
    }, [receipt, reset, isDirty])

    const carrierId = watch("carrierId")
    const carriersQuery = useQuery({ queryKey: ["carriers"], queryFn: () => listCarriersApi() })
    const carrierIdNumber = carrierId ? Number(carrierId) : null
    const noQualityPercentage = watch("noQualityPercentage")
    const weightValue = watch("weight")
    const totalBasketsValue = watch("totalBaskets")
    const basketIdValue = watch("basketId")
    const qualityPercentageValue = watch("qualityPercentage")

    const selectedBasket = useMemo(
        () => basketsQuery.data?.data.find((basket) => basket.id === basketIdValue) ?? (receipt?.fieldDataReceptions[0]?.basket.id === basketIdValue ? receipt.fieldDataReceptions[0].basket : null),
        [basketsQuery.data, basketIdValue, receipt]
    )
    const originalField = receipt?.fieldDataReceptions[0]
    const tara = originalField && basketIdValue === originalField.basket.id && totalBasketsValue === originalField.totalBaskets ? originalField.weightBaskets
        : selectedBasket && Number.isFinite(totalBasketsValue) ? selectedBasket.weight * totalBasketsValue : null
    const netWeight = Number.isFinite(weightValue) && tara !== null ? weightValue - tara : null
    const validPounds =
        !noQualityPercentage && netWeight !== null && qualityPercentageValue !== undefined && Number.isFinite(qualityPercentageValue)
            ? netWeight * (qualityPercentageValue / 100)
            : null

    const reviewKey = JSON.stringify([watch("docDate"), watch("fincaId"), watch("producerId"), watch("productId"), watch("cdpId"), carrierId, watch("plateId"), watch("pilotName"), watch("inspectorName"), basketIdValue, weightValue, totalBasketsValue, tara, qualityPercentageValue, noQualityPercentage])
    const reviewed = reviewedKey === reviewKey
    const invalidWeight = netWeight !== null && netWeight < 0
    const dateRange = documentDateRange()
    const unchangedDate = !!receipt && watch("docDate") === guatemalaDate(new Date(receipt.docDate))

    const platesQuery = useQuery({
        queryKey: ["plates", carrierIdNumber],
        queryFn: () => listPlatesApi(carrierIdNumber),
        enabled: carrierIdNumber !== null,
    })
    const plateId = watch("plateId")
    const selectedPlate = platesQuery.data?.data.find(plate => plate.id === Number(plateId))
        ?? (originalField?.plate?.id === Number(plateId) ? originalField.plate : null)
    const validateTruckWeight = !editing || Number(plateId) !== originalField?.plate?.id || weightValue !== originalField?.weight
    const truckWeightError = validateTruckWeight ? truckGrossWeightError(selectedPlate, weightValue) : null
    const truckWeightBlocked = validateTruckWeight && (!!truckWeightError || (!!plateId && !selectedPlate))

    useEffect(() => {
        if (noQualityPercentage) {
            setValue("qualityPercentage", undefined)
        }
    }, [noQualityPercentage, setValue])

    const saveMutation = useMutation({
        mutationFn: ({ values: formData, reason = "", expectedVersion }: FieldSubmission) => {
            const payload = {
                docDate: formData.docDate,
                fincaId: Number(formData.fincaId),
                carrierId: Number(formData.carrierId),
                plateId: Number(formData.plateId),
                producerId: formData.producerId!,
                productId: formData.productId!,
                basketId: formData.basketId!,
                cdpId: formData.cdpId ?? undefined,
                inspectorName: formData.inspectorName,
                pilotName: formData.pilotName,
                weight: formData.weight,
                totalBaskets: formData.totalBaskets,
                qualityPercentage: formData.noQualityPercentage ? undefined : formData.qualityPercentage,
                inspectorSignature: formData.inspectorSignature!,
                driverSignature: formData.driverSignature!,
                prodSignature: formData.prodSignature!,
            }
            const { inspectorSignature: _inspectorSignature, driverSignature: _driverSignature, prodSignature: _prodSignature, ...editablePayload } = payload
            return editing ? editFieldApi(receptionId, { ...editablePayload, reason, expectedVersion: expectedVersion!,
                cdpId: formData.cdpId ?? null, qualityPercentage: formData.noQualityPercentage ? null : formData.qualityPercentage!,
            }) : createRmReceptionApi(payload)
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
        if (saveMutation.isPending) return
        if (truckWeightBlocked) { toast.error(truckWeightError ?? "Selecciona una placa válida antes de continuar."); return }
        if (invalidWeight) { toast.error("El peso bruto no puede ser menor que la tara."); return }
        if (!reviewed) { toast.error("Revisa y confirma los datos antes de firmar y guardar."); return }
        if (editing) setPendingEdit({ values: formData, expectedVersion: originalVersion.current ?? receipt!.editVersion })
        else saveMutation.mutate({ values: formData })
    })

    const isPending = saveMutation.isPending

    const fincaOptions = useMemo(
        () => includeHistoricalOption((fincasQuery.data?.data ?? []).map(finca => ({ value: finca.id, label: finca.name })), receipt && { value: receipt.finca.id, label: receipt.finca.name }),
        [fincasQuery.data, receipt]
    )
    const producerOptions = useMemo(
        () => includeHistoricalOption((producersQuery.data?.data ?? []).map((producer) => ({ value: producer.id, label: producer.name, description: producer.code })), originalField && { value: originalField.producer.id, label: originalField.producer.name, description: originalField.producer.code }),
        [producersQuery.data, originalField]
    )
    const productOptions = useMemo(
        () =>
            includeHistoricalOption((productsQuery.data?.data ?? []).map((product) => ({
                value: product.id,
                label: product.name,
                description:
                    product.varietyProduct && product.varietyProduct.name !== product.name
                        ? `(${product.varietyProduct.name})`
                        : undefined,
            })), originalField && { value: originalField.product.id, label: originalField.product.name, description: originalField.product.varietyProduct?.name }),
        [productsQuery.data, originalField]
    )
    const basketOptions = useMemo(
        () => includeHistoricalOption((basketsQuery.data?.data ?? []).map((basket) => ({ value: basket.id, label: basket.code, description: `${formatDecimal(basket.weight)} lb` })), originalField && { value: originalField.basket.id, label: originalField.basket.code }),
        [basketsQuery.data, originalField]
    )
    const cdpOptions = useMemo(
        () => includeHistoricalOption((cdpsQuery.data?.data ?? []).map((cdp) => ({ value: cdp.id, label: cdp.name, description: cdp.finca?.name })), originalField?.cdp && { value: originalField.cdp.id, label: originalField.cdp.name }),
        [cdpsQuery.data, originalField]
    )

    const fincaError = obtenerMensajeErrorCampo(errors.fincaId)
    const carrierError = obtenerMensajeErrorCampo(errors.carrierId)
    const plateError = obtenerMensajeErrorCampo(errors.plateId)
    const producerError = errors.producerId?.message
    const productError = errors.productId?.message
    const basketError = errors.basketId?.message
    const cdpError = errors.cdpId?.message
    const inspectorNameError = obtenerMensajeErrorCampo(errors.inspectorName)
    const pilotNameError = obtenerMensajeErrorCampo(errors.pilotName)
    const weightError = obtenerMensajeErrorCampo(errors.weight)
    const totalBasketsError = obtenerMensajeErrorCampo(errors.totalBaskets)
    const qualityPercentageError = obtenerMensajeErrorCampo(errors.qualityPercentage)
    const inspectorSignatureError = errors.inspectorSignature?.message
    const driverSignatureError = errors.driverSignature?.message
    const prodSignatureError = errors.prodSignature?.message

    if (editing && receiptQuery.isLoading) return <LoadingSpinner />
    if (editing && !receipt) return <p role="alert">{receiptQuery.error?.message ?? "No se pudo cargar la boleta."}</p>
    if (editing ? !canMutateReceipt(receipt!, user) || !canEditStage(receipt!, "field", user?.permissions ?? [], user?.role) : !user?.permissions.includes("rawMaterialReceptions:create")) return <Navigate to="/403" replace />

    return (
        <PageContainer size="form" className="pb-10">
            <PageHeader title={editing ? "Corregir datos de campo" : "Crear boleta materia prima"} description={editing ? `Boleta #${receptionId.toString().padStart(6, "0")}` : "Completa los datos de recepción en campo"} />

            <form onSubmit={onSubmit} className="space-y-6">
                {editing && <EditNotice count={receipt!.fieldEditCount} override={user?.permissions.includes("rawMaterialReceptions:overrideEdit") ?? false} />}
                <Card>
                    <SectionTitle>Datos generales</SectionTitle>

                    <FormField label="Finca" htmlFor="fincaId" error={fincaError}>
                        <Controller
                            control={control}
                            name="fincaId"
                            render={({ field }) => (
                                <Combobox
                                    id="fincaId"
                                    value={field.value ? Number(field.value) : null}
                                    onChange={value => field.onChange(value === null ? "" : String(value))}
                                    options={fincaOptions}
                                    loading={fincasQuery.isLoading}
                                    hasError={!!fincaError}
                                    disabled={isPending}
                                    placeholder="Selecciona una finca"
                                    emptyMessage="No se encontraron fincas"
                                />
                            )}
                        />
                    </FormField>

                    <FormField label="Fecha de creación de documento" htmlFor="docDate" error={obtenerMensajeErrorCampo(errors.docDate)}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Controller name="docDate" control={control} render={({ field }) => <DateInput {...field}
                                id="docDate" min={unchangedDate ? undefined : dateRange.yesterday} max={unchangedDate ? undefined : dateRange.today}
                                readOnly={!dateEditable} disabled={isPending} hasError={!!errors.docDate} required />} />
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={isPending}
                                aria-controls="docDate"
                                aria-pressed={dateEditable}
                                className="shrink-0"
                                onClick={() => setDateEditable(value => !value)}
                            >
                                {dateEditable ? <Check size={16} /> : <Pencil size={16} />}
                                {dateEditable ? "Fijar fecha" : "Editar fecha"}
                            </Button>
                        </div>
                        <p className="mt-2 text-xs text-text-tertiary">
                            Puedes corregir la fecha cuando tu rol y la etapa de la boleta permitan editar los datos de campo.
                        </p>
                    </FormField>
                </Card>

                <Card>
                    <SectionTitle>Origen</SectionTitle>

                    <FormField label="Productor" htmlFor="producerId" error={producerError}>
                        <Controller
                            control={control}
                            name="producerId"
                            render={({ field }) => (
                                <Combobox
                                    id="producerId"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={producerOptions}
                                    loading={producersQuery.isLoading}
                                    hasError={!!producerError}
                                    disabled={isPending}
                                    placeholder="Selecciona un productor"
                                />
                            )}
                        />
                    </FormField>

                    <FormField label="Tipo de producto" htmlFor="productId" error={productError}>
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
                                    disabled={isPending || !!receipt?.qualityControlDocs?.length}
                                    placeholder="Selecciona un tipo de producto"
                                />
                            )}
                        />
                    </FormField>
                    {!!receipt?.qualityControlDocs?.length && <p className="text-sm text-text-tertiary">El producto se conserva porque la evaluación firmada contiene sus defectos y tolerancias.</p>}
                </Card>

                <Card>
                    <SectionTitle>Transporte</SectionTitle>
                    <FormField label="Transportista" htmlFor="carrierId" error={carrierError}>
                        <Select id="carrierId" hasError={!!carrierError} disabled={isPending || carrierRepresentative} {...register("carrierId", { onChange: () => setValue("plateId", "") })}>
                            <option value="">Selecciona un transportista</option>
                            {originalField?.carrier && !carriersQuery.data?.data.some(carrier => carrier.id === originalField.carrier?.id) && <option value={originalField.carrier.id}>{originalField.carrier.name}</option>}
                            {(carriersQuery.data?.data ?? []).filter(carrier => !carrierRepresentative || carrier.id === user?.representedCarrierId).map((carrier) => (
                                <option key={carrier.id} value={carrier.id}>
                                    {carrier.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Placa" htmlFor="plateId" error={plateError}>
                        <Select
                            id="plateId"
                            hasError={!!plateError}
                            disabled={isPending || !carrierIdNumber}
                            {...register("plateId")}
                        >
                            <option value="">
                                {carrierIdNumber ? "Selecciona una placa" : "Primero selecciona un transportista"}
                            </option>
                            {originalField?.plate && carrierIdNumber === originalField.carrier?.id && !platesQuery.data?.data.some(plate => plate.id === originalField.plate?.id) && <option value={originalField.plate.id}>{originalField.plate.name}</option>}
                            {(platesQuery.data?.data ?? []).map((plate) => (
                                <option key={plate.id} value={plate.id}>
                                    {plate.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Nombre del piloto" htmlFor="pilotName" error={pilotNameError}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Input id="pilotName" disabled={isPending} readOnly={!pilotEditable} hasError={!!pilotNameError} maxLength={255} required {...register("pilotName")} />
                            <Button type="button" variant="secondary" disabled={isPending} aria-controls="pilotName" aria-pressed={pilotEditable} onClick={() => setPilotEditable(value => !value)}>
                                {pilotEditable ? <Check size={16} /> : <Pencil size={16} />}
                                {pilotEditable ? "Fijar nombre" : "Editar nombre"}
                            </Button>
                        </div>
                    </FormField>
                </Card>

                <Card>
                    <SectionTitle>Inspección</SectionTitle>

                    <FormField label="Nombre del inspector" htmlFor="inspectorName" error={inspectorNameError}>
                        <Input
                            id="inspectorName"
                            placeholder="Nombre completo"
                            hasError={!!inspectorNameError}
                            disabled={isPending}
                            {...register("inspectorName")}
                        />
                    </FormField>

                    <FormField label="CDP" htmlFor="cdpId" error={cdpError}>
                        <Controller
                            control={control}
                            name="cdpId"
                            render={({ field }) => (
                                <Combobox
                                    id="cdpId"
                                    value={field.value ?? null}
                                    onChange={field.onChange}
                                    options={cdpOptions}
                                    loading={cdpsQuery.isLoading}
                                    hasError={!!cdpError}
                                    disabled={isPending}
                                    placeholder="Selecciona un CDP"
                                />
                            )}
                        />
                    </FormField>

                    <FormField label="Peso bruto (lb)" htmlFor="weight" error={weightError}>
                        <Input
                            id="weight"
                            min={Number.MIN_VALUE}
                            required
                            aria-describedby="field-gross-weight-warning"
                            type="number"
                            inputMode="decimal"
                            step="any"
                            placeholder="0.00"
                            hasError={!!weightError || !!truckWeightError}
                            disabled={isPending}
                            {...register("weight", { valueAsNumber: true })}
                        />
                        <GrossWeightWarning id="field-gross-weight-warning" value={weightValue} baskets={totalBasketsValue} plate={selectedPlate} validate={validateTruckWeight} />
                        {invalidWeight && <p role="alert" className="mt-2 text-sm text-error-fg">El peso bruto no puede ser menor que la tara.</p>}
                    </FormField>

                    <FormField label="Tipo de canasta" htmlFor="basketId" error={basketError}>
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
                                    disabled={isPending}
                                    placeholder="Selecciona un tipo de canasta"
                                />
                            )}
                        />
                    </FormField>

                    <FormField label="Cantidad de canastas" htmlFor="totalBaskets" error={totalBasketsError}>
                        <Input
                            id="totalBaskets"
                            min={1}
                            required
                            type="number"
                            inputMode="numeric"
                            step="1"
                            placeholder="0"
                            hasError={!!totalBasketsError}
                            disabled={isPending}
                            {...register("totalBaskets", { valueAsNumber: true })}
                        />
                    </FormField>

                    <FormField label="Porcentaje de calidad" htmlFor="qualityPercentage" error={qualityPercentageError}>
                        <Input
                            id="qualityPercentage"
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min={1}
                            max={99.99}
                            placeholder="1 - 99"
                            hasError={!!qualityPercentageError}
                            disabled={isPending || noQualityPercentage}
                            {...register("qualityPercentage", { valueAsNumber: true })}
                        />
                        <Checkbox
                            id="noQualityPercentage"
                            label="Sin porcentaje de calidad (se define al recibir en planta)"
                            className="mt-2"
                            disabled={isPending}
                            {...register("noQualityPercentage")}
                        />
                    </FormField>

                    <div className="rounded-[10px] border-[1.5px] border-border-light bg-bg-primary p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                            Resultados calculados
                        </p>
                        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <dt className="text-xs text-text-tertiary">Tara (lb)</dt>
                                <dd className="text-lg font-semibold text-dark">{formatNumero(tara)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-tertiary">Peso neto (lb)</dt>
                                <dd className="text-lg font-semibold text-dark">{formatNumero(netWeight)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-tertiary">Libras a pagar</dt>
                                <dd className="text-lg font-semibold text-dark">
                                    {noQualityPercentage ? "No aplica" : formatNumero(validPounds)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </Card>

                <Card>
                    <SectionTitle>{editing ? "Verificar datos" : "Firmas"}</SectionTitle>
                    <ReviewBeforeSigning producer={producersQuery.data?.data.find(item => item.id === watch("producerId"))?.name ?? originalField?.producer.name}
                        product={productsQuery.data?.data.find(item => item.id === watch("productId"))?.name ?? originalField?.product.name}
                        gross={weightValue} baskets={totalBasketsValue} tare={tara} net={netWeight} confirmed={reviewed}
                        onConfirm={value => setReviewedKey(value ? reviewKey : "")} disabled={isPending || truckWeightBlocked} />

                    {!editing && <>
                    <FormField label="Firma del piloto" htmlFor="driverSignature" error={driverSignatureError}>
                        <Controller
                            control={control}
                            name="driverSignature"
                            render={({ field }) => (
                                <SignaturePad
                                    readOnly={editing}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isPending || !reviewed || truckWeightBlocked}
                                    hasError={!!driverSignatureError}
                                />
                            )}
                        />
                    </FormField>

                    <FormField label="Firma del inspector" htmlFor="inspectorSignature" error={inspectorSignatureError}>
                        <Controller
                            control={control}
                            name="inspectorSignature"
                            render={({ field }) => (
                                <SignaturePad
                                    readOnly={editing}
                                    value={field.value}
                                    onChange={field.onChange}
                                disabled={isPending || !reviewed || truckWeightBlocked}
                                    hasError={!!inspectorSignatureError}
                                />
                            )}
                        />
                    </FormField>

                    <FormField label="Firma del productor" htmlFor="prodSignature" error={prodSignatureError}>
                        <Controller
                            control={control}
                            name="prodSignature"
                            render={({ field }) => (
                                <SignaturePad
                                    readOnly={editing}
                                    value={field.value}
                                    onChange={field.onChange}
                                disabled={isPending || !reviewed || truckWeightBlocked}
                                    hasError={!!prodSignatureError}
                                />
                            )}
                        />
                    </FormField>
                    </>}
                </Card>

                <FormActions onCancel={() => navigate("/boletas")} isPending={isPending} submitDisabled={truckWeightBlocked} submitLabel={editing ? "Guardar corrección de campo" : "Guardar boleta"} />
            </form>
            {pendingEdit && <EditReasonModal isPending={isPending} error={saveMutation.error?.message}
                onCancel={() => { setPendingEdit(null); saveMutation.reset() }}
                onConfirm={reason => saveMutation.mutate({ ...pendingEdit, reason })} />}
        </PageContainer>
    )
}
