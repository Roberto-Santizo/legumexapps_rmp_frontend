import { formatDecimal } from "@/shared/utils/formatDecimal"
import { Controller, useForm } from "react-hook-form"
import { useState, useEffect, useRef } from "react"
import { ProductEvaluationConfirmation } from "../component/ProductEvaluationConfirmation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { ClipboardCheck } from "lucide-react"
import { toast } from "sonner"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { PageContainer } from "@/shared/component/pageContainer.component"
import { PageHeader } from "@/shared/component/pageHeader.component"
import { Card } from "@/shared/component/card.component"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { Textarea } from "@/shared/component/textarea.component"
import { SignaturePad } from "@/shared/component/signaturePad.component"
import { FormActions } from "@/shared/component/formActions.component"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/shared/component/table.component"
import { getQualityContext, saveQualityEvaluation } from "../api/qualityEvaluation.api"
import { createQualityFormSchema } from "../schema/qualityEvaluation.schema"
import type { QualityFormInput } from "../schema/qualityEvaluation.schema"
import { calculateQualityPreview } from "../utils/qualityCalculation"
import { EditNotice } from "@/features/rawMaterialReceptions/component/EditNotice"
import { EditReasonModal } from "@/features/rawMaterialReceptions/component/EditReasonModal"
import "../styles/qualityEvaluation.css"
import { canMutateReceipt } from "@/features/rawMaterialReceptions/utils/editPolicy"
import { PestInspectionFields } from "../component/PestInspectionFields"
import { calculatePestPreview } from "../utils/pestEvaluation"

function ReadonlyField({ label, value, id }: { label: string; value: string | number; id: string }) {
    return <FormField label={label} htmlFor={id}><Input id={id} value={value} readOnly className="bg-bg-primary" /></FormField>
}

const format = (value: number | null) => value === null ? "—" : formatDecimal(value)
const optionalNumber = (value: unknown) => value === "" || value === null || value === undefined ? null : Number(value)
type QualitySubmission = { values: QualityFormInput; expectedVersion: number; configurationVersion: string; reason?: string }

export function QualityEvaluation({ editing = false }: { editing?: boolean }) {
    const { id } = useParams()
    const receptionId = Number(id)
    const { user } = useAuthentication()
    const canEvaluate = editing ? !!user?.permissions.some(permission => ["qualityEvaluations:edit", "rawMaterialReceptions:overrideEdit"].includes(permission))
        : !!user?.permissions.includes("qualityEvaluations:view") && user.permissions.includes("qualityEvaluations:create")
    const [pendingEdit, setPendingEdit] = useState<QualitySubmission | null>(null)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const contextQuery = useQuery({
        queryKey: ["quality-evaluation", receptionId, editing], queryFn: () => getQualityContext(receptionId, editing),
        enabled: canEvaluate && Number.isSafeInteger(receptionId) && receptionId > 0,
        refetchOnWindowFocus: false,
    })
    const context = contextQuery.data?.data
    const evaluation = context?.evaluation
    const field = context?.boleta.fieldDataReceptions[0]
    const plant = context?.boleta.prodDataReceptions[0]
    const pestRule = context?.pestControl?.rule ?? null
    const confirmationKey = context && field ? JSON.stringify([receptionId, field.product.id, field.product.name, field.product.varietyProduct?.id, field.product.varietyProduct?.name, context.configurationVersion]) : null
    const [confirmedProduct, setConfirmedProduct] = useState<string | null>(null)
    const productConfirmed = confirmationKey !== null && confirmedProduct === confirmationKey
    const originalContext = useRef<{ version: number; configuration: string } | null>(null)
    const { control, register, handleSubmit, watch, reset, formState: { errors, isDirty } } = useForm<QualityFormInput>({
        resolver: zodResolver(createQualityFormSchema(editing, !!pestRule)),
        defaultValues: { harvestDocNumber: "", ph: null, brix: null, observations: "", inspectorSignature: null, defects: [], pestInspection: null },
    })
    useEffect(() => {
        if (!context || isDirty) return
        originalContext.current = { version: context.boleta.editVersion, configuration: context.configurationVersion }
        reset({
            harvestDocNumber: evaluation?.harvestDocNumber ?? "", sampleUnits: Number(evaluation?.sampleUnits ?? 0), ph: evaluation?.ph ?? null,
            brix: evaluation?.brix ?? null, observations: evaluation?.observations ?? "", inspectorSignature: evaluation?.inspectorSignature ?? null,
            pestInspection: context.pestControl?.rule ? {
                wormCount: evaluation?.pestEvaluation?.wormCount ?? null, aphidHeadsCount: evaluation?.pestEvaluation?.aphidHeadsCount ?? null,
            } : null,
            defects: context.defects.map(defect => ({ defectId: defect.id, name: defect.defectName, tolerancePercentage: defect.tolerancePercentage,
                input: evaluation?.qualityControlDefects.find(item => item.id === defect.id)?.input ?? 0 })),
        })
    }, [context, evaluation, reset, isDirty])
    const observedDefects = watch("defects")
    const calculations = calculateQualityPreview(plant?.netWeight ?? 0, observedDefects, !!pestRule)
    const pestPreview = calculatePestPreview(pestRule, watch("pestInspection"))
    const saveMutation = useMutation({
        mutationFn: ({ values, expectedVersion, configurationVersion, reason = "" }: QualitySubmission) => saveQualityEvaluation(receptionId, values, configurationVersion, expectedVersion, editing, reason),
        onSuccess: async result => {
            if (!result) return
            toast.success(result.message)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["rm-receptions"] }),
                queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] }),
                queryClient.invalidateQueries({ queryKey: ["reception-history"] }),
            ])
            queryClient.removeQueries({ queryKey: ["quality-evaluation", receptionId] })
            navigate("/boletas")
        },
        onError: error => toast.error(error.message),
    })

    if (!canEvaluate || (context && !canMutateReceipt(context.boleta, user))) return <Navigate to="/403" replace />
    if (contextQuery.isLoading) return <LoadingSpinner />
    if (!context || !field || !plant) return <PageContainer size="wide">
        <p role="alert" className="text-error-fg">{contextQuery.error?.message ?? "No se pudo cargar la evaluación de esta boleta."}</p>
        <Link to="/boletas" className="mt-4 inline-block text-primary-dark underline">Volver a boletas</Link>
    </PageContainer>

    const blocked = saveMutation.isPending || (!context.defects.length && !pestRule) || plant.netWeight < 0
    const belowAccepted = calculations.percentage !== null && calculations.percentage < context.acceptedPercentage
    const consignmentReasons = [
        ...(belowAccepted ? [`Consignado por porcentaje de calidad inferior al mínimo: ${formatDecimal(calculations.percentage!)} % (mínimo ${formatDecimal(context.acceptedPercentage)} %).`] : []),
        ...(pestPreview?.reasons ?? []),
    ]

    if (!productConfirmed) return <PageContainer size="wide" className="pb-10">
        <PageHeader icon={ClipboardCheck} title={editing ? "Corregir evaluación de calidad" : "Evaluación de calidad"} description={`Boleta #${receptionId.toString().padStart(6, "0")}`} />
        <ProductEvaluationConfirmation key={confirmationKey} product={field.product.name} variety={field.product.varietyProduct?.name ?? "Sin variedad registrada"}
            onConfirm={() => setConfirmedProduct(confirmationKey)} onCancel={() => navigate("/boletas")} />
    </PageContainer>

    return <PageContainer size="wide" className="pb-10">
        <PageHeader icon={ClipboardCheck} title={editing ? "Corregir evaluación de calidad" : "Evaluación de calidad"} description={`Boleta #${receptionId.toString().padStart(6, "0")}`} />
        <form noValidate onSubmit={handleSubmit(values => {
            if (!productConfirmed || saveMutation.isPending) return
            const submission = { values, expectedVersion: originalContext.current?.version ?? context.boleta.editVersion, configurationVersion: originalContext.current?.configuration ?? context.configurationVersion }
            if (editing) setPendingEdit(submission)
            else saveMutation.mutate(submission)
        })} className="space-y-6">
            {editing && <EditNotice count={context.boleta.qualityEditCount} override={user?.permissions.includes("rawMaterialReceptions:overrideEdit") ?? false} />}
            <Card>
                <h2 className="mb-5 text-lg font-semibold text-dark">Información general</h2>
                <div className="grid gap-x-5 md:grid-cols-2 xl:grid-cols-3">
                    <ReadonlyField id="quality-product" label="Producto y variedad" value={[field.product.name, field.product.varietyProduct?.name].filter(Boolean).join(" · ")} />
                    <ReadonlyField id="quality-field-percentage" label="Porcentaje de campo" value={field.qualityPercentage === null ? "Sin porcentaje registrado" : `${formatDecimal(field.qualityPercentage)} %`} />
                    <ReadonlyField id="quality-producer" label="Productor" value={field.producer.name} />
                    <ReadonlyField id="quality-net-weight" label="Peso neto en planta (lb)" value={format(plant.netWeight)} />
                    <ReadonlyField id="quality-baskets" label="Cantidad de canastas en planta" value={plant.totalBaskets} />
                </div>
                <div className="border-t border-border-light pt-5">
                    <p className="mb-4 text-sm text-text-tertiary"><span className="text-error-fg">*</span> Campos obligatorios</p>
                    <div className="grid gap-x-5 md:grid-cols-2">
                    <FormField label="No. hoja de cosechero" htmlFor="harvestDocNumber" required error={errors.harvestDocNumber?.message}>
                        <Input id="harvestDocNumber" aria-required="true" maxLength={255} placeholder="Número de hoja de cosechero" disabled={saveMutation.isPending} hasError={!!errors.harvestDocNumber} {...register("harvestDocNumber")} />
                    </FormField>
                    <FormField label="Unidades de muestra" htmlFor="sampleUnits" required error={errors.sampleUnits?.message}>
                        <Input id="sampleUnits" aria-required="true" type="number" inputMode="numeric" min={1} step="1" disabled={saveMutation.isPending} hasError={!!errors.sampleUnits} {...register("sampleUnits", { valueAsNumber: true })} />
                    </FormField>
                    </div>
                </div>
                {plant.netWeight < 0 && <p role="alert" className="text-error-fg">El peso neto de planta es negativo. Revisa la recepción antes de evaluar.</p>}
            </Card>

            {pestRule && <PestInspectionFields rule={pestRule} evaluation={pestPreview} register={register} errors={errors} disabled={saveMutation.isPending} />}
            {context.pestControl?.enabled && !pestRule && <p role="alert" className="rounded-xl border border-border-light p-4 text-sm text-text-tertiary">No se pudo determinar la muestra de gusanos y áfidos. Revisa la cantidad de canastas recibidas en planta.</p>}

            <Card>
                <h2 className="mb-2 text-lg font-semibold text-dark">Puntos a verificar</h2>
                <p className="mb-5 text-sm text-text-tertiary">Ingresa el porcentaje observado de cada defecto. Solo se descuenta lo que excede su tolerancia; los resultados menores a cero se toman como cero.</p>
                {!context.defects.length && pestRule ? <p className="rounded-xl border border-border-light p-4 text-sm text-dark">Este producto se evalúa únicamente mediante el control de gusanos y áfidos. No tiene descuentos porcentuales activos.</p> : !context.defects.length ? <p role="alert" className="rounded-xl border border-aviso-bd bg-aviso-bg p-4 text-aviso-fg">
                    Este producto no tiene defectos activos. Configúralos en Productos antes de realizar la evaluación.
                </p> : <Table className="quality-defects-table">
                    <TableHead><TableRow><Th>Defecto</Th><Th>% defecto observado</Th><Th>% tolerancia aceptada</Th><Th>Resultado</Th></TableRow></TableHead>
                    <TableBody>{context.defects.map((defect, index) => <TableRow key={defect.id}>
                        <Td className="font-semibold">{defect.defectName}</Td>
                        <Td><div className="min-w-32 max-w-48">
                            <Input id={`quality-defect-${defect.id}`} type="number" inputMode="decimal" min={0} max={100} step="any"
                                aria-label={`Porcentaje observado: ${defect.defectName}`} aria-describedby={errors.defects?.[index]?.input ? `quality-defect-error-${defect.id}` : undefined}
                                hasError={!!errors.defects?.[index]?.input} disabled={blocked} {...register(`defects.${index}.input`, { valueAsNumber: true })} />
                            {errors.defects?.[index]?.input?.message && <p id={`quality-defect-error-${defect.id}`} role="alert" className="mt-1 text-xs text-error-fg">{errors.defects[index]?.input?.message}</p>}
                        </div></Td>
                        <Td>{format(defect.tolerancePercentage)} %</Td><Td className="font-semibold">{format(calculations.results[index] ?? null)} %</Td>
                    </TableRow>)}</TableBody>
                </Table>}
                <div className="mt-5 flex flex-col gap-2 text-lg font-semibold sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8" role="status" aria-live="polite" aria-atomic="true">
                    <p className="text-dark">Total de defectos: {format(calculations.totalDefects)} %</p>
                    <p className="text-error-fg">Porcentaje de calidad de esta evaluación: {format(calculations.percentage)} %</p>
                </div>
                {calculations.totalDefects !== null && calculations.totalDefects > 100 && <p className="mt-2 text-sm text-aviso-fg">El total supera 100 %. Revisa los porcentajes ingresados. El porcentaje a pagar se limita a 0 %.</p>}
            </Card>

            <Card>
                <h2 className="mb-5 text-lg font-semibold text-dark">Información calculada</h2>
                <div className="grid gap-x-5 sm:grid-cols-2 xl:grid-cols-4">
                    <ReadonlyField id="quality-pounds" label="Libras pagables" value={format(calculations.validPounds)} />
                    <ReadonlyField id="quality-percentage" label="% de calidad / a pagar" value={calculations.percentage === null ? "—" : `${format(calculations.percentage)} %`} />
                    <FormField label="pH" htmlFor="ph" error={errors.ph?.message}>
                        <Input id="ph" type="number" inputMode="decimal" min={0} max={14} step="any" disabled={saveMutation.isPending} hasError={!!errors.ph} {...register("ph", { setValueAs: optionalNumber })} />
                    </FormField>
                    <FormField label="Brix" htmlFor="brix" error={errors.brix?.message}>
                        <Input id="brix" type="number" inputMode="decimal" min={0} max={100} step="any" disabled={saveMutation.isPending} hasError={!!errors.brix} {...register("brix", { setValueAs: optionalNumber })} />
                    </FormField>
                </div>
                {consignmentReasons.length > 0 && <div role="status" className="mb-5 rounded-xl border border-aviso-bd bg-aviso-bg p-4 text-sm text-aviso-fg">
                    <p className="font-semibold">Al guardar, la boleta quedará en consignación.</p>
                    {consignmentReasons.map(reason => <p key={reason} className="mt-2">{reason}</p>)}
                </div>}
                <FormField label="Observaciones" htmlFor="observations" error={errors.observations?.message}>
                    <Textarea id="observations" rows={8} maxLength={20000} className="resize-y" placeholder="Observaciones generales" disabled={saveMutation.isPending} hasError={!!errors.observations} {...register("observations")} />
                    <p className="mt-2 text-xs text-text-tertiary">Puedes escribir varias líneas, hasta 20,000 caracteres, y ampliar el cuadro hacia abajo.</p>
                </FormField>
                {!editing && <FormField label="Firma del evaluador de calidad" htmlFor="quality-signature" error={errors.inspectorSignature?.message}>
                    <div id="quality-signature"><Controller control={control} name="inspectorSignature" render={({ field: signature }) =>
                        <SignaturePad readOnly={editing} value={signature.value} onChange={signature.onChange} disabled={blocked} hasError={!!errors.inspectorSignature} />
                    } /></div>
                    <p className="mt-3 text-center text-sm font-semibold text-dark">{editing && !watch("inspectorSignature")?.startsWith("data:") ? evaluation?.evaluatorName : user?.name}</p>
                </FormField>}
            </Card>
            <FormActions onCancel={() => navigate("/boletas")} isPending={saveMutation.isPending} submitDisabled={blocked} submitLabel={editing ? "Guardar corrección de calidad" : "Guardar evaluación de calidad"} />
        </form>
        {pendingEdit && <EditReasonModal isPending={saveMutation.isPending} error={saveMutation.error?.message}
            onCancel={() => { setPendingEdit(null); saveMutation.reset() }}
            onConfirm={reason => saveMutation.mutate({ ...pendingEdit, reason })} />}
    </PageContainer>
}
