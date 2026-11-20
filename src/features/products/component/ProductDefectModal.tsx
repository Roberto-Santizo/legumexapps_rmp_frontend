import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
type Props = { initial: Defect; editing: boolean; names: string[]; canAddAnother: boolean; onClose: () => void; onSave: (defect: Defect, another: boolean) => void }

export function ProductDefectModal({ initial, editing, names, canAddAnother, onClose, onSave }: Props) {
    const queryClient = useQueryClient()
    const { user } = useAuthentication()
    const canManage = user?.permissions.includes("products:manageDefects") ?? false
    const catalogKey = ["defect-catalog", canManage]
    const catalogQuery = useQuery({ queryKey: catalogKey, queryFn: () => listDefectCatalogApi(canManage) })
    const [creating, setCreating] = useState(false)
    const [catalogEdit, setCatalogEdit] = useState<DefectCatalogEntry | null>(null)
    const [newName, setNewName] = useState("")
    const [catalogActive, setCatalogActive] = useState(true)
    const { control, register, watch, handleSubmit, reset, setValue, setError, clearErrors, formState: { errors } } = useForm<Defect>({ resolver: zodResolver(productDefectFormSchema), defaultValues: { ...initial, defectCatalogId: initial.defectCatalogId ?? null } })
    const entries = catalogQuery.data?.data ?? []
    const catalog = initial.defectCatalogId && !entries.some(entry => entry.id === initial.defectCatalogId)
        ? [...entries, { id: initial.defectCatalogId, name: initial.name, activo: initial.catalogActive ?? true, aliases: [] }]
        : entries
    const selected = catalog.find(entry => entry.id === watch("defectCatalogId"))
    const linked = (name: string) => names.some(existing => normalizeDefectName(existing) === normalizeDefectName(name))

    function select(entry: DefectCatalogEntry | undefined) {
        setValue("defectCatalogId", entry?.id ?? null, { shouldDirty: true })
        setValue("name", entry?.name ?? "", { shouldDirty: true })
        setValue("catalogActive", entry?.activo, { shouldDirty: true })
        clearErrors(["name", "defectCatalogId"])
    }

    function savedCatalog(result: Awaited<ReturnType<typeof createDefectCatalogApi>>) {
        if (!result) return
        queryClient.setQueryData<{ data: DefectCatalogEntry[] }>(catalogKey, previous => ({
            data: [...(previous?.data ?? []).filter(entry => entry.id !== result.data.id), result.data]
                .sort((a, b) => a.name.localeCompare(b.name, "es")),
        }))
        select(result.data)
        setCreating(false)
        setCatalogEdit(null)
        setNewName("")
        queryClient.invalidateQueries({ queryKey: ["defect-catalog"] })
        // No recargar el detalle mientras el formulario padre tiene cambios sin guardar.
        queryClient.invalidateQueries({ queryKey: ["products"], refetchType: "none" })
        queryClient.invalidateQueries({ queryKey: ["quality-evaluation"] })
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        toast.success(result.message)
    }
    const createMutation = useMutation({ mutationFn: createDefectCatalogApi, onSuccess: savedCatalog })
    const updateMutation = useMutation({ mutationFn: updateDefectCatalogApi, onSuccess: savedCatalog })
    const writingCatalog = createMutation.isPending || updateMutation.isPending
    const editingCatalog = creating || catalogEdit !== null

    function create() {
        if (!canManage || writingCatalog) return
        const name = newName.trim()
        if (!name || name.length > 255) {
            setError("name", { message: "Ingresa un nombre de 1 a 255 caracteres" })
            return
        }
        if (linked(name)) {
            setError("name", { message: "Este defecto ya está relacionado con el producto" })
            return
        }
        if (catalogEdit) {
            updateMutation.mutate({ id: catalogEdit.id, name, activo: catalogActive })
            return
        }
        const key = normalizeDefectName(name)
        const existing = catalog.find(entry => normalizeDefectName(entry.name) === key || entry.aliases.some(alias => alias.normalizedName === key))
        if (existing) {
            if (!existing.activo || linked(existing.name)) {
                setError("name", { message: !existing.activo ? "El defecto ya existe y está inactivo. Puedes reactivarlo desde el catálogo." : "Este defecto ya está relacionado con el producto" })
                return
            }
            select(existing)
            setCreating(false)
            setNewName("")
            toast.info("Este defecto ya existe; se seleccionó el registrado")
        } else createMutation.mutate({ name })
    }

    function save(another: boolean) {
        return handleSubmit(values => {
            const entry = catalog.find(item => item.id === values.defectCatalogId)
            if (!entry) {
                setError("name", { message: "Selecciona un defecto del catálogo" })
                return
            }
            if (linked(entry.name)) {
                setError("name", { message: "Este defecto ya está relacionado con el producto" })
                return
            }
            onSave({ ...values, defectCatalogId: entry.id, name: entry.name, catalogActive: entry.activo }, another)
            if (another) reset({ name: "", defectCatalogId: null, tolerancePercentage: 0, activo: true })
        })
    }

    const unavailable = catalogQuery.isLoading || catalogQuery.isError || writingCatalog
    return <Modal title={editing ? "Editar defecto del producto" : "Relacionar defecto"} onClose={onClose} closeDisabled={writingCatalog}>
        <form onSubmit={event => {
            event.stopPropagation()
            if (editingCatalog || unavailable) { event.preventDefault(); if (editingCatalog && !unavailable) create(); return }
            void save(false)(event)
        }}>
            <FormField label="Defecto del catálogo" htmlFor="modal-defect-catalog" required error={errors.name?.message ?? errors.defectCatalogId?.message ?? catalogQuery.error?.message}>
                <Controller name="defectCatalogId" control={control} render={({ field }) => <Combobox
                    id="modal-defect-catalog" value={field.value ?? null} onChange={id => select(catalog.find(entry => entry.id === id))}
                    options={catalog.filter(entry => !linked(entry.name) && (entry.activo || canManage || entry.id === initial.defectCatalogId)).map(entry => ({ value: entry.id, label: entry.name, description: entry.activo ? undefined : "Inactivo", searchTerms: entry.aliases.map(alias => alias.name) }))}
                    placeholder="Busca y selecciona un defecto" emptyMessage="No se encontraron defectos disponibles"
                    loading={catalogQuery.isLoading} disabled={unavailable || editingCatalog} ignoreAccents hasError={!!errors.name || !!errors.defectCatalogId}
                />} />
            </FormField>
            {catalogQuery.isError && <Button type="button" variant="secondary" onClick={() => void catalogQuery.refetch()}>Volver a cargar catálogo</Button>}
            {canManage && !editingCatalog && <div className="mb-5 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" disabled={unavailable} onClick={() => { clearErrors("name"); createMutation.reset(); setNewName(""); setCreating(true) }}>Crear nuevo defecto</Button>
                {selected && <Button type="button" variant="secondary" disabled={unavailable} onClick={() => { clearErrors("name"); updateMutation.reset(); setCatalogEdit(selected); setNewName(selected.name); setCatalogActive(selected.activo) }}>Editar en catálogo</Button>}
            </div>}
            {canManage && editingCatalog && <div className="mb-5 rounded-xl border border-border-light p-4">
                <FormField label={catalogEdit ? "Nombre oficial del defecto" : "Nombre del nuevo defecto"} htmlFor="modal-new-defect" error={createMutation.error?.message ?? updateMutation.error?.message}>
                    <Input id="modal-new-defect" maxLength={255} value={newName} disabled={writingCatalog} placeholder="Ej. PUDRICIÓN" onChange={event => { setNewName(event.target.value); clearErrors("name"); createMutation.reset(); updateMutation.reset() }} />
                </FormField>
                {catalogEdit && <Checkbox id="modal-catalog-active" label="Disponible para nuevas asociaciones" checked={catalogActive} disabled={writingCatalog} onChange={event => setCatalogActive(event.target.checked)} />}
                <p className="mb-3 text-sm text-text-tertiary">El nombre se comparte entre productos. La tolerancia se configura por separado para cada producto.</p>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" disabled={unavailable || !newName.trim()} onClick={create}>{writingCatalog ? "Guardando..." : catalogEdit ? "Guardar cambios del catálogo" : "Crear y seleccionar"}</Button>
                    <Button type="button" variant="secondary" disabled={writingCatalog} onClick={() => { setCreating(false); setCatalogEdit(null); clearErrors("name") }}>Volver al catálogo</Button>
                </div>
            </div>}
            <FormField label="Tolerancia de este producto (%)" htmlFor="modal-defect-tolerance" required error={errors.tolerancePercentage?.message}>
                <Input id="modal-defect-tolerance" aria-required="true" type="number" inputMode="decimal" min={0} max={100} step="any" disabled={writingCatalog} hasError={!!errors.tolerancePercentage} {...register("tolerancePercentage", { valueAsNumber: true })} />
            </FormField>
            <Checkbox id="modal-defect-active" label="Activo para este producto" disabled={writingCatalog} {...register("activo")} />
            <p className="my-5 text-sm text-text-tertiary">Guarda el producto para aplicar esta relación y su tolerancia. Las evaluaciones anteriores conservan sus datos.</p>
            <div className="flex flex-col gap-2">
                <Button type="submit" disabled={unavailable || editingCatalog}>Guardar relación</Button>
                {!editing && canAddAnother && <Button type="button" variant="secondary" disabled={unavailable || editingCatalog} onClick={() => void save(true)()}>Guardar y agregar otro</Button>}
                <Button type="button" variant="secondary" disabled={writingCatalog} onClick={onClose}>Cancelar</Button>
            </div>
        </form>
    </Modal>
}
