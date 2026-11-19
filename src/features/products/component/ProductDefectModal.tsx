import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productDefectFormSchema } from "../schema/product.schema"
import type { ProductFormInput } from "../schema/product.schema"
import { Modal } from "@/shared/component/modal.component"
import { Input } from "@/shared/component/input.component"
import { Button } from "@/shared/component/button.component"
import { Checkbox } from "@/shared/component/checkbox.component"
import { FormField } from "@/shared/component/formField.component"

type Defect = ProductFormInput["defects"][number]
type Props = { initial: Defect; editing: boolean; names: string[]; canAddAnother: boolean; onClose: () => void; onSave: (defect: Defect, another: boolean) => void }

export function ProductDefectModal({ initial, editing, names, canAddAnother, onClose, onSave }: Props) {
    const { register, handleSubmit, reset, setFocus, setError, formState: { errors } } = useForm<Defect>({ resolver: zodResolver(productDefectFormSchema), defaultValues: initial })
    function save(another: boolean) {
        return handleSubmit(values => {
            const name = values.name.trim().toUpperCase()
            if (names.some(existing => existing.trim().toUpperCase() === name)) {
                setError("name", { message: "Este defecto ya está relacionado" }, { shouldFocus: true })
                return
            }
            onSave({ ...values, name }, another)
            if (another) { reset({ name: "", tolerancePercentage: 0, activo: true }); setFocus("name") }
        })
    }
    return <Modal title={editing ? "Editar defecto" : "Relacionar defecto"} onClose={onClose}>
        <form onSubmit={event => { event.stopPropagation(); void save(false)(event) }}>
            <FormField label="Nombre del defecto" htmlFor="modal-defect-name" required error={errors.name?.message}>
                <Input id="modal-defect-name" aria-required="true" maxLength={255} placeholder="Ej. MANCHAS NEGRAS" hasError={!!errors.name} {...register("name")} />
            </FormField>
            <FormField label="Tolerancia (%)" htmlFor="modal-defect-tolerance" required error={errors.tolerancePercentage?.message}>
                <Input id="modal-defect-tolerance" aria-required="true" type="number" inputMode="decimal" min={0} max={100} step="any" hasError={!!errors.tolerancePercentage} {...register("tolerancePercentage", { valueAsNumber: true })} />
            </FormField>
            <Checkbox id="modal-defect-active" label="Activo" {...register("activo")} />
            <p className="my-5 text-sm text-text-tertiary">El defecto quedará en la lista. Guarda el producto para aplicar los cambios.</p>
            <div className="flex flex-col gap-2">
                <Button type="submit">Guardar defecto</Button>
                {!editing && canAddAnother && <Button type="button" variant="secondary" onClick={() => void save(true)()}>Guardar y agregar otro</Button>}
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            </div>
        </form>
    </Modal>
}
