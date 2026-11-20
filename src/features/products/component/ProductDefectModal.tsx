import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { productDefectFormSchema } from "../schema/product.schema"
import type { ProductFormInput } from "../schema/product.schema"
import { createDefectCatalogApi, listDefectCatalogApi } from "../api/defectCatalog.api"
import type { DefectCatalogEntry } from "../api/defectCatalog.api"
import { normalizeDefectName } from "../utils/defectName"
import { Modal } from "@/shared/component/modal.component"
import { Input } from "@/shared/component/input.component"
import { Button } from "@/shared/component/button.component"
import { Checkbox } from "@/shared/component/checkbox.component"
import { FormField } from "@/shared/component/formField.component"
import { Combobox } from "@/shared/component/combobox.component"

type Defect = ProductFormInput["defects"][number]
type Props = { initial: Defect; editing: boolean; names: string[]; canAddAnother: boolean; onClose: () => void; onSave: (defect: Defect, another: boolean) => void }

export function ProductDefectModal({ initial, editing, names, canAddAnother, onClose, onSave }: Props) {
    const queryClient = useQueryClient()
    const catalogQuery = useQuery({ queryKey: ["defect-catalog"], queryFn: listDefectCatalogApi })
    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState("")
    const { control, register, handleSubmit, reset, setValue, setError, clearErrors, formState: { errors } } = useForm<Defect>({ resolver: zodResolver(productDefectFormSchema), defaultValues: { ...initial, defectCatalogId: initial.defectCatalogId ?? null } })
    const catalog = catalogQuery.data?.data ?? []
    const linked = (name: string) => names.some(existing => normalizeDefectName(existing) === normalizeDefectName(name))

    function select(entry: DefectCatalogEntry | undefined) {
        setValue("defectCatalogId", entry?.id ?? null, { shouldDirty: true })
        setValue("name", entry?.name ?? "", { shouldDirty: true })
        clearErrors(["name", "defectCatalogId"])
    }

    const createMutation = useMutation({
        mutationFn: createDefectCatalogApi,
        onSuccess: result => {
            if (!result) return
            queryClient.setQueryData<{ data: DefectCatalogEntry[] }>(["defect-catalog"], previous => ({
                data: [...(previous?.data ?? []).filter(entry => entry.id !== result.data.id), result.data]
                    .sort((a, b) => a.name.localeCompare(b.name, "es")),
            }))
            select(result.data)
            setCreating(false)
            setNewName("")
            toast.success(result.message)
        },
    })

    function create() {
        const name = newName.trim()
        if (!name || name.length > 255) {
            setError("name", { message: "Ingresa un nombre de 1 a 255 caracteres" })
            return
        }
        if (linked(name)) {
            setError("name", { message: "Este defecto ya está relacionado con el producto" })
            return
        }
        const existing = catalog.find(entry => normalizeDefectName(entry.name) === normalizeDefectName(name))
        if (existing) {
            select(existing)
            setCreating(false)
            setNewName("")
            toast.info("Este defecto ya existe; se seleccionó el registrado")
        } else if (!createMutation.isPending) createMutation.mutate(name)
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
            onSave({ ...values, defectCatalogId: entry.id, name: entry.name }, another)
            if (another) reset({ name: "", defectCatalogId: null, tolerancePercentage: 0, activo: true })
        })
    }

    const unavailable = catalogQuery.isLoading || catalogQuery.isError || createMutation.isPending
    return <Modal title={editing ? "Editar defecto del producto" : "Relacionar defecto"} onClose={onClose} closeDisabled={createMutation.isPending}>
        <form onSubmit={event => {
            event.stopPropagation()
            if (creating || unavailable) { event.preventDefault(); if (creating && !unavailable) create(); return }
            void save(false)(event)
        }}>
            <FormField label="Defecto del catálogo" htmlFor="modal-defect-catalog" required error={errors.name?.message ?? errors.defectCatalogId?.message ?? catalogQuery.error?.message}>
                <Controller name="defectCatalogId" control={control} render={({ field }) => <Combobox
                    id="modal-defect-catalog" value={field.value ?? null} onChange={id => select(catalog.find(entry => entry.id === id))}
                    options={catalog.filter(entry => !linked(entry.name)).map(entry => ({ value: entry.id, label: entry.name }))}
                    placeholder="Busca y selecciona un defecto" emptyMessage="No se encontraron defectos disponibles"
                    loading={catalogQuery.isLoading} disabled={unavailable || creating} ignoreAccents hasError={!!errors.name || !!errors.defectCatalogId}
                />} />
            </FormField>
            {catalogQuery.isError && <Button type="button" variant="secondary" onClick={() => void catalogQuery.refetch()}>Volver a cargar catálogo</Button>}
            {!creating ? <Button type="button" variant="secondary" disabled={unavailable} onClick={() => { clearErrors("name"); createMutation.reset(); setCreating(true) }}>Crear nuevo defecto</Button> : <div className="mb-5 rounded-xl border border-border-light p-4">
                <FormField label="Nombre del nuevo defecto" htmlFor="modal-new-defect" error={createMutation.error?.message}>
                    <Input id="modal-new-defect" maxLength={255} value={newName} disabled={createMutation.isPending} placeholder="Ej. PUDRICIÓN" onChange={event => { setNewName(event.target.value); clearErrors("name"); createMutation.reset() }} />
                </FormField>
                <p className="mb-3 text-sm text-text-tertiary">El nombre quedará disponible para otros productos. Cada producto tendrá su propia tolerancia.</p>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" disabled={unavailable || !newName.trim()} onClick={create}>{createMutation.isPending ? "Creando..." : "Crear y seleccionar"}</Button>
                    <Button type="button" variant="secondary" disabled={createMutation.isPending} onClick={() => { setCreating(false); clearErrors("name") }}>Volver al catálogo</Button>
                </div>
            </div>}
            <FormField label="Tolerancia de este producto (%)" htmlFor="modal-defect-tolerance" required error={errors.tolerancePercentage?.message}>
                <Input id="modal-defect-tolerance" aria-required="true" type="number" inputMode="decimal" min={0} max={100} step="any" disabled={createMutation.isPending} hasError={!!errors.tolerancePercentage} {...register("tolerancePercentage", { valueAsNumber: true })} />
            </FormField>
            <Checkbox id="modal-defect-active" label="Activo para este producto" disabled={createMutation.isPending} {...register("activo")} />
            <p className="my-5 text-sm text-text-tertiary">Guarda el producto para aplicar esta relación y su tolerancia. Las evaluaciones anteriores conservan sus datos.</p>
            <div className="flex flex-col gap-2">
                <Button type="submit" disabled={unavailable || creating}>Guardar relación</Button>
                {!editing && canAddAnother && <Button type="button" variant="secondary" disabled={unavailable || creating} onClick={() => void save(true)()}>Guardar y agregar otro</Button>}
                <Button type="button" variant="secondary" disabled={createMutation.isPending} onClick={onClose}>Cancelar</Button>
            </div>
        </form>
    </Modal>
}
