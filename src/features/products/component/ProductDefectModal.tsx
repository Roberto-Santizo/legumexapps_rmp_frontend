import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Check, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { productDefectFormSchema } from "../schema/product.schema"
import type { ProductFormInput } from "../schema/product.schema"
import { createDefectCatalogApi, listDefectCatalogApi, updateDefectCatalogApi } from "../api/defectCatalog.api"
import type { DefectCatalogEntry } from "../api/defectCatalog.api"
import { normalizeDefectName } from "../utils/defectName"
import { Modal } from "@/shared/component/modal.component"
import { Input } from "@/shared/component/input.component"
import { Button } from "@/shared/component/button.component"
import { Checkbox } from "@/shared/component/checkbox.component"
import { FormField } from "@/shared/component/formField.component"
import { Combobox } from "@/shared/component/combobox.component"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"

type Defect = ProductFormInput["defects"][number]
type View = { kind: "relation"; focus?: "tolerance" } | { kind: "create" } | { kind: "catalog"; entry: DefectCatalogEntry }
type Props = {
    initial: Defect; editing: boolean; names: string[]; canAddAnother: boolean; productName?: string
    onClose: () => void; onSave: (defect: Defect, another: boolean) => void
}

function focusControl(id: string) {
    if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(() => document.getElementById(id)?.focus())
}

function SectionTitle({ step, id, title }: { step: number; id: string; title: string }) {
    return <div className="mb-4 flex items-center gap-3">
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-dark">{step}</span>
        <h3 id={id} className="text-sm font-semibold text-dark">{title}</h3>
    </div>
}

export function ProductDefectModal({ initial, editing, names, canAddAnother, productName, onClose, onSave }: Props) {
    const queryClient = useQueryClient()
    const { user } = useAuthentication()
    const canManage = user?.permissions.includes("products:manageDefects") ?? false
    const catalogKey = ["defect-catalog", canManage]
    const catalogQuery = useQuery({ queryKey: catalogKey, queryFn: () => listDefectCatalogApi(canManage) })
    const [view, setView] = useState<View>({ kind: "relation" })
    const [newName, setNewName] = useState("")
    const [catalogActive, setCatalogActive] = useState(true)
    const [catalogNameError, setCatalogNameError] = useState<string | null>(null)
    const [addAnother, setAddAnother] = useState(false)
    const { control, register, watch, handleSubmit, reset, setValue, setError, clearErrors, formState: { errors } } = useForm<Defect>({
        resolver: zodResolver(productDefectFormSchema), defaultValues: { ...initial, defectCatalogId: initial.defectCatalogId ?? null },
    })
    const entries = catalogQuery.data?.data ?? []
    const catalog = initial.defectCatalogId && !entries.some(entry => entry.id === initial.defectCatalogId)
        ? [...entries, { id: initial.defectCatalogId, name: initial.name, activo: initial.catalogActive ?? true }]
        : entries
    const selected = catalog.find(entry => entry.id === watch("defectCatalogId"))
    const linked = (name: string) => names.some(existing => normalizeDefectName(existing) === normalizeDefectName(name))
    const matchName = (name: string) => {
        const key = normalizeDefectName(name)
        return catalog.find(entry => normalizeDefectName(entry.name) === key)
    }
    const existingMatch = view.kind === "create" && newName.trim() ? matchName(newName) : undefined
    const productLabel = productName?.trim() || "este producto"

    useEffect(() => {
        focusControl(view.kind === "relation" ? view.focus === "tolerance" ? "modal-defect-tolerance" : "modal-defect-catalog" : "modal-new-defect")
    }, [view])

    function select(entry: DefectCatalogEntry | undefined) {
        setValue("defectCatalogId", entry?.id ?? null, { shouldDirty: true })
        setValue("name", entry?.name ?? "", { shouldDirty: true })
        setValue("catalogActive", entry?.activo, { shouldDirty: true })
        clearErrors(["name", "defectCatalogId"])
    }

    function savedCatalog(result: Awaited<ReturnType<typeof createDefectCatalogApi>>) {
        if (!result) return
        queryClient.setQueryData<{ data: DefectCatalogEntry[] }>(catalogKey, previous => ({
            data: [...(previous?.data ?? []).filter(entry => entry.id !== result.data.id), result.data].sort((a, b) => a.name.localeCompare(b.name, "es")),
        }))
        select(result.data)
        setView({ kind: "relation", focus: "tolerance" })
        setNewName("")
        setCatalogNameError(null)
        queryClient.invalidateQueries({ queryKey: ["defect-catalog"] })
        // Mantener los cambios sin guardar del formulario de producto.
        queryClient.invalidateQueries({ queryKey: ["products"], refetchType: "none" })
        queryClient.invalidateQueries({ queryKey: ["quality-evaluation"] })
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        toast.success(view.kind === "create" ? "Defecto seleccionado. Define su tolerancia para el producto." : "Nombre y disponibilidad actualizados.")
    }
    const createMutation = useMutation({ mutationFn: createDefectCatalogApi, onSuccess: savedCatalog })
    const updateMutation = useMutation({ mutationFn: updateDefectCatalogApi, onSuccess: savedCatalog })
    const writingCatalog = createMutation.isPending || updateMutation.isPending
    const unavailable = catalogQuery.isLoading || catalogQuery.isError || writingCatalog
    const canUseSelected = !!selected && (selected.activo || (initial.id !== undefined && selected.id === initial.defectCatalogId))

    function returnToRelation(focus?: "tolerance") {
        setView({ kind: "relation", focus })
        setCatalogNameError(null)
        createMutation.reset()
        updateMutation.reset()
    }

    function openCatalogEditor(entry?: DefectCatalogEntry) {
        if (!canManage || unavailable) return
        setNewName(entry?.name ?? "")
        setCatalogActive(entry?.activo ?? true)
        setCatalogNameError(null)
        createMutation.reset()
        updateMutation.reset()
        setView(entry ? { kind: "catalog", entry } : { kind: "create" })
    }

    function saveCatalog() {
        if (!canManage || unavailable || view.kind === "relation") return
        const name = newName.trim()
        if (!name || name.length > 255) { setCatalogNameError("Escribe un nombre de 1 a 255 caracteres."); return }
        if (linked(name)) { setCatalogNameError("Este defecto ya está agregado al producto. Elige otro nombre."); return }
        if (view.kind === "catalog") {
            updateMutation.mutate({ id: view.entry.id, name, activo: catalogActive })
            return
        }
        const existing = matchName(name)
        if (existing) {
            if (linked(existing.name)) { setCatalogNameError("Este defecto ya está agregado al producto."); return }
            if (!existing.activo) { setCatalogNameError("Este defecto está desactivado. Reactívalo antes de agregarlo."); return }
            select(existing)
            returnToRelation("tolerance")
            toast.info("Seleccionamos el defecto que ya existe. Define su tolerancia.")
        } else createMutation.mutate({ name })
    }

    function saveRelation(another: boolean) {
        return handleSubmit(values => {
            if (!selected) { setError("name", { message: "Selecciona un defecto de la lista." }); return }
            if (!canUseSelected) { setError("name", { message: "Activa el defecto en el catálogo antes de agregarlo." }); return }
            if (linked(selected.name)) { setError("name", { message: "Este defecto ya está agregado al producto." }); return }
            onSave({ ...values, defectCatalogId: selected.id, name: selected.name, catalogActive: selected.activo }, another)
            if (another) {
                reset({ name: "", defectCatalogId: null, tolerancePercentage: 0, activo: true })
                focusControl("modal-defect-catalog")
            }
        })
    }

    const title = view.kind === "create" ? "Crear nuevo defecto" : view.kind === "catalog" ? "Editar nombre del defecto" : editing ? "Editar defecto del producto" : "Agregar defecto al producto"
    return <Modal title={title} onClose={onClose} closeDisabled={writingCatalog}>
        <form noValidate aria-busy={writingCatalog} onSubmit={event => {
            event.preventDefault()
            event.stopPropagation()
            if (unavailable) return
            if (view.kind !== "relation") { saveCatalog(); return }
            void saveRelation(!editing && canAddAnother && addAnother)(event)
        }}>
            {catalogQuery.isError && <div role="alert" className="mb-5 rounded-xl border border-error-fg/20 bg-error-bg p-3 text-sm text-error-fg">
                <p>No se pudo cargar la lista de defectos.</p>
                <button type="button" className="mt-2 font-semibold underline" onClick={() => void catalogQuery.refetch()}>Volver a intentar</button>
            </div>}

            {view.kind === "relation" ? <>
                <p className="mb-6 text-sm leading-relaxed text-text-tertiary">Selecciona el defecto y define la tolerancia para <span className="font-medium text-dark">{productLabel}</span>.</p>
                <section aria-labelledby="defect-selection-title">
                    <SectionTitle step={1} id="defect-selection-title" title="Selecciona el defecto" />
                    <FormField label="Defecto" htmlFor="modal-defect-catalog" required error={errors.name?.message ?? errors.defectCatalogId?.message}>
                        <Controller name="defectCatalogId" control={control} render={({ field }) => <Combobox
                            id="modal-defect-catalog" value={field.value ?? null} onChange={id => select(catalog.find(entry => entry.id === id))}
                            options={catalog.filter(entry => !linked(entry.name) && (entry.activo || entry.id === initial.defectCatalogId)).map(entry => ({ value: entry.id, label: entry.name, description: entry.activo ? undefined : "Desactivado" }))}
                            placeholder="Busca un defecto por su nombre" emptyMessage="No hay coincidencias disponibles"
                            loading={catalogQuery.isLoading} disabled={unavailable} ignoreAccents hasError={!!errors.name || !!errors.defectCatalogId}
                        />} />
                        {canManage && <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            {selected ? <button type="button" className="inline-flex min-h-9 items-center gap-1.5 rounded-md text-xs font-medium text-text-tertiary hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50" disabled={unavailable} onClick={() => openCatalogEditor(selected)}>
                                <Pencil size={13} aria-hidden="true" /> Editar nombre compartido
                            </button> : <span className="text-xs text-text-tertiary">¿No está en la lista?</span>}
                            <button type="button" className="inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm font-semibold text-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50" disabled={unavailable} onClick={() => openCatalogEditor()}>
                                <Plus size={15} aria-hidden="true" /> Crear nuevo defecto
                            </button>
                        </div>}
                    </FormField>
                    {selected && !selected.activo && <p role="status" className="mb-5 rounded-xl bg-aviso-bg p-3 text-sm text-aviso-fg">Este defecto está desactivado en el catálogo. {canUseSelected ? "Puedes conservar su configuración en este producto." : "Activa su disponibilidad antes de agregarlo."}</p>}
                </section>
                <section aria-labelledby="defect-tolerance-title" className="border-t border-border-light pt-5">
                    <SectionTitle step={2} id="defect-tolerance-title" title="Define la tolerancia del producto" />
                    <FormField label="Tolerancia permitida (%)" htmlFor="modal-defect-tolerance" required error={errors.tolerancePercentage?.message}>
                        <div className="relative">
                            <Input id="modal-defect-tolerance" aria-describedby="defect-tolerance-help" type="number" inputMode="decimal" min={0} max={100} step="any" className="pr-12 text-base font-semibold" disabled={unavailable} hasError={!!errors.tolerancePercentage} {...register("tolerancePercentage", { valueAsNumber: true })} />
                            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">%</span>
                        </div>
                        <p id="defect-tolerance-help" className="mt-2 text-xs leading-relaxed text-text-tertiary">Solo se descontará el porcentaje observado que supere esta tolerancia.</p>
                    </FormField>
                    <div className="rounded-xl border border-border-light p-3.5">
                        <Checkbox id="modal-defect-active" label="Evaluar este defecto en el producto" disabled={unavailable} {...register("activo")} />
                        <p className="ml-6 mt-1 text-xs leading-relaxed text-text-tertiary">Puedes desactivarlo sin quitarlo de la lista.</p>
                    </div>
                </section>
                <p className="mt-4 text-xs leading-relaxed text-text-tertiary">Al terminar, guarda el producto para aplicar los cambios.</p>
                <div className="mt-5 border-t border-border-light pt-4">
                    {!editing && canAddAnother && <div className="mb-4"><Checkbox id="modal-add-another" label="Agregar otro después" checked={addAnother} disabled={unavailable} onChange={event => setAddAnother(event.target.checked)} /></div>}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="secondary" disabled={writingCatalog} onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={unavailable || !canUseSelected}>{editing ? "Guardar cambios" : "Agregar al producto"}</Button>
                    </div>
                </div>
            </> : <>
                <div className="mb-6 rounded-xl bg-bg-primary p-4 text-sm leading-relaxed text-text-tertiary">
                    {view.kind === "create" ? <p>Crea el nombre del defecto. Después definirás su tolerancia para <span className="font-medium text-dark">{productLabel}</span>.</p> : <p>Este nombre se actualizará en todos los productos que utilizan el defecto. La tolerancia de cada producto se conserva.</p>}
                </div>
                <FormField label="Nombre del defecto" htmlFor="modal-new-defect" required error={catalogNameError ?? createMutation.error?.message ?? updateMutation.error?.message}>
                    <Input id="modal-new-defect" maxLength={255} value={newName} disabled={writingCatalog} placeholder="Ej. MANCHAS EN LA PIEL" hasError={!!catalogNameError || !!createMutation.error || !!updateMutation.error} onChange={event => { setNewName(event.target.value); setCatalogNameError(null); createMutation.reset(); updateMutation.reset() }} />
                    <p className="mt-2 text-xs leading-relaxed text-text-tertiary">Usa un nombre claro y específico. Estará disponible para otros productos.</p>
                </FormField>
                {existingMatch && <div role="status" className="mb-5 rounded-xl border border-border-light bg-bg-primary p-4 text-sm">
                    <div className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-text-tertiary" aria-hidden="true" /><div>
                        <p className="text-xs text-text-tertiary">Ya existe un defecto con este nombre</p>
                        <p className="mt-1 break-words font-semibold text-dark">{existingMatch.name}</p>
                        {linked(existingMatch.name) ? <p className="mt-2 text-xs text-error-fg">Ya está agregado a este producto. Vuelve y selecciona otro defecto.</p> : !existingMatch.activo ? <button type="button" className="mt-2 min-h-8 text-xs font-semibold underline" onClick={() => openCatalogEditor(existingMatch)}>Revisar su disponibilidad</button> : <p className="mt-2 text-xs text-text-tertiary">Puedes usarlo directamente sin crear otro.</p>}
                    </div></div>
                </div>}
                {view.kind === "catalog" && <div className="rounded-xl border border-border-light p-4">
                    <Checkbox id="modal-catalog-active" label="Disponible para agregar a otros productos" checked={catalogActive} disabled={writingCatalog} onChange={event => setCatalogActive(event.target.checked)} />
                    <p className="ml-6 mt-1 text-xs leading-relaxed text-text-tertiary">Desactivarlo conserva las relaciones que ya existen.</p>
                </div>}
                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border-light pt-4 sm:flex-row sm:justify-between">
                    <Button type="button" variant="secondary" disabled={writingCatalog} onClick={() => returnToRelation()}><ArrowLeft size={16} aria-hidden="true" /> Volver</Button>
                    <Button type="submit" disabled={unavailable || !newName.trim() || (!!existingMatch && (!existingMatch.activo || linked(existingMatch.name)))}>
                        {writingCatalog ? "Guardando..." : view.kind === "catalog" ? "Guardar nombre y volver" : existingMatch ? "Usar este defecto" : "Crear defecto y continuar"}
                        {!writingCatalog && <ArrowRight size={16} aria-hidden="true" />}
                    </Button>
                </div>
            </>}
        </form>
    </Modal>
}
