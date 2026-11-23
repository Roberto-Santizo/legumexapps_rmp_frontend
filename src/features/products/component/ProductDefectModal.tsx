import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { productDefectFormSchema } from "../schema/product.schema"
import type { ProductFormInput } from "../schema/product.schema"
import { listDefectNamesApi } from "../api/product.api"
import { normalizeDefectName } from "../utils/defectName"
import { Modal } from "@/shared/component/modal.component"
import { Input } from "@/shared/component/input.component"
import { Button } from "@/shared/component/button.component"
import { Checkbox } from "@/shared/component/checkbox.component"
import { FormField } from "@/shared/component/formField.component"

type Defect = ProductFormInput["defects"][number]
type Props = {
    initial: Defect; editing: boolean; names: string[]; canAddAnother: boolean; productName?: string
    onClose: () => void; onSave: (defect: Defect, another: boolean) => void
}

const MAX_SUGGESTIONS = 8

function focusControl(id: string) {
    if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(() => document.getElementById(id)?.focus())
}

export function ProductDefectModal({ initial, editing, names, canAddAnother, productName, onClose, onSave }: Props) {
    const namesQuery = useQuery({ queryKey: ["product-defect-names"], queryFn: listDefectNamesApi })
    const [addAnother, setAddAnother] = useState(false)
    const { register, watch, handleSubmit, reset, setValue, setError, clearErrors, formState: { errors } } = useForm<Defect>({
        resolver: zodResolver(productDefectFormSchema), defaultValues: initial,
    })
    const linkedNames = new Set(names.map(normalizeDefectName))
    const typed = normalizeDefectName(watch("defectName") ?? "")
    const known = namesQuery.data?.data ?? []
    const exactMatch = typed ? known.find(name => name === typed) : undefined
    const suggestions = typed && !exactMatch
        ? known.filter(name => name.includes(typed) && !linkedNames.has(name)).slice(0, MAX_SUGGESTIONS)
        : []
    const productLabel = productName?.trim() || "este producto"

    useEffect(() => { focusControl("modal-defect-name") }, [])

    function choose(name: string) {
        setValue("defectName", name, { shouldDirty: true })
        clearErrors("defectName")
        focusControl("modal-defect-tolerance")
    }

    function save(another: boolean) {
        return handleSubmit(values => {
            const defectName = normalizeDefectName(values.defectName)
            if (linkedNames.has(defectName)) { setError("defectName", { message: "Este defecto ya está agregado al producto." }); return }
            onSave({ ...values, defectName }, another)
            if (another) {
                reset({ defectName: "", tolerancePercentage: 0, activo: true })
                focusControl("modal-defect-name")
            }
        })
    }

    return <Modal title={editing ? "Editar defecto del producto" : "Agregar defecto al producto"} onClose={onClose}>
        <form noValidate onSubmit={event => {
            event.preventDefault()
            event.stopPropagation()
            void save(!editing && canAddAnother && addAnother)(event)
        }}>
            <p className="mb-6 text-sm leading-relaxed text-text-tertiary">Escribe el defecto y define la tolerancia para <span className="font-medium text-dark">{productLabel}</span>. Se guarda en mayúsculas y sin tildes.</p>
            <FormField label="Defecto" htmlFor="modal-defect-name" required error={errors.defectName?.message}>
                <Input id="modal-defect-name" maxLength={255} autoComplete="off" placeholder="Ej. MANCHAS NEGRAS" hasError={!!errors.defectName} {...register("defectName")} />
                {typed && <p role="status" className="mt-2 text-xs leading-relaxed text-text-tertiary">
                    Se guardará como <span className="font-semibold text-dark">{typed}</span>{exactMatch ? " (ya existe en otros productos)." : "."}
                </p>}
                {suggestions.length > 0 && <div className="mt-3">
                    <p className="mb-2 text-xs text-text-tertiary">Defectos ya registrados. Usa uno de estos para no duplicarlo:</p>
                    <ul className="flex flex-wrap gap-2">
                        {suggestions.map(name => <li key={name}>
                            <button type="button" onClick={() => choose(name)} className="min-h-9 rounded-full border border-border-light bg-bg-primary px-3 text-xs font-medium text-dark hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{name}</button>
                        </li>)}
                    </ul>
                </div>}
            </FormField>
            <FormField label="Tolerancia permitida (%)" htmlFor="modal-defect-tolerance" required error={errors.tolerancePercentage?.message}>
                <div className="relative">
                    <Input id="modal-defect-tolerance" aria-describedby="defect-tolerance-help" type="number" inputMode="decimal" min={0} max={100} step="any" className="pr-12 text-base font-semibold" hasError={!!errors.tolerancePercentage} {...register("tolerancePercentage", { valueAsNumber: true })} />
                    <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">%</span>
                </div>
                <p id="defect-tolerance-help" className="mt-2 text-xs leading-relaxed text-text-tertiary">Solo se descontará el porcentaje observado que supere esta tolerancia.</p>
            </FormField>
            <div className="rounded-xl border border-border-light p-3.5">
                <Checkbox id="modal-defect-active" label="Evaluar este defecto en el producto" {...register("activo")} />
                <p className="ml-6 mt-1 text-xs leading-relaxed text-text-tertiary">Puedes desactivarlo sin quitarlo de la lista.</p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-tertiary">Al terminar, guarda el producto para aplicar los cambios.</p>
            <div className="mt-5 border-t border-border-light pt-4">
                {!editing && canAddAnother && <div className="mb-4"><Checkbox id="modal-add-another" label="Agregar otro después" checked={addAnother} onChange={event => setAddAnother(event.target.checked)} /></div>}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">{editing ? "Guardar cambios" : "Agregar al producto"}</Button>
                </div>
            </div>
        </form>
    </Modal>
}
