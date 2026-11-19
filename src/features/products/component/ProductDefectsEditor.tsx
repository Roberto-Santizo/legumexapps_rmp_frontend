import { formatDecimal } from "@/shared/utils/formatDecimal"
import { useState } from "react"
import { useFieldArray, useWatch } from "react-hook-form"
import type { Control, FieldErrors } from "react-hook-form"
import type { ProductFormInput } from "../schema/product.schema"
import { Button } from "@/shared/component/button.component"
import { Badge } from "@/shared/component/badge.component"
import { Plus, Trash2, Pencil } from "lucide-react"
import { ProductDefectModal } from "./ProductDefectModal"

type Props = { control: Control<ProductFormInput>; errors: FieldErrors<ProductFormInput>; disabled: boolean }
const emptyDefect = { name: "", tolerancePercentage: 0, activo: true }

export function ProductDefectsEditor({ control, errors, disabled }: Props) {
    const { fields, append, update, remove } = useFieldArray({ control, name: "defects", keyName: "formKey" })
    const values = useWatch({ control, name: "defects" })
    const [editor, setEditor] = useState<number | null>(null)
    const canAdd = !disabled && fields.length < 200
    return <section aria-labelledby="product-defects-title" className="mb-6 border-t border-border-light pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="product-defects-title" className="text-lg font-semibold text-dark">Defectos del producto ({fields.length})</h2>
            <Button type="button" disabled={!canAdd} onClick={() => setEditor(-1)}><Plus size={16} aria-hidden="true" /> Relacionar defecto</Button>
        </div>
        <p className="mb-4 text-sm text-text-tertiary">Configura los defectos de este producto y variedad. Guarda el producto para aplicar los cambios.</p>
        {!fields.length ? <p className="rounded-[10px] bg-bg-primary p-4 text-sm text-text-tertiary">Este producto todavía no tiene defectos relacionados.</p> :
            <ul aria-label="Defectos relacionados" className="max-h-[28rem] divide-y divide-border-light overflow-y-auto rounded-xl border border-border-light">
                {fields.map((field, index) => {
                    const defect = values[index] ?? field
                    const error = errors.defects?.[index]
                    return <li key={field.formKey} className="flex flex-wrap items-center justify-between gap-3 bg-bg-primary p-4">
                        <div className="min-w-0 flex-1">
                            <p className="break-words font-semibold text-dark">{defect.name}</p>
                            <p className="mt-1 text-sm text-text-tertiary">Tolerancia: {formatDecimal(defect.tolerancePercentage)} %</p>
                            {(error?.name?.message || error?.tolerancePercentage?.message) && <p role="alert" className="mt-1 text-sm text-error-fg">{error.name?.message ?? error.tolerancePercentage?.message}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant={defect.activo ? "exito" : "error"}>{defect.activo ? "Activo" : "Inactivo"}</Badge>
                            <button type="button" disabled={disabled} aria-label={`Editar defecto ${defect.name}`} onClick={() => setEditor(index)} className="btn-icon btn-icon-primary"><Pencil size={17} /></button>
                            {defect.id === undefined && <button type="button" disabled={disabled} aria-label={`Quitar defecto sin guardar ${defect.name}`} onClick={() => remove(index)} className="btn-icon"><Trash2 size={17} /></button>}
                        </div>
                    </li>
                })}
            </ul>}
        {fields.length > 0 && <div className="mt-3 flex justify-end"><Button type="button" variant="secondary" disabled={!canAdd} onClick={() => setEditor(-1)}><Plus size={16} aria-hidden="true" /> Relacionar otro defecto</Button></div>}
        {errors.defects?.root?.message && <p role="alert" className="mt-2 text-sm text-error-fg">{errors.defects.root.message}</p>}
        {editor !== null && <ProductDefectModal initial={editor < 0 ? emptyDefect : values[editor]} editing={editor >= 0}
            names={values.filter((_, index) => index !== editor).map(defect => defect.name)} canAddAnother={fields.length < 199}
            onClose={() => setEditor(null)} onSave={(defect, another) => {
                if (editor < 0) append(defect, { shouldFocus: false })
                else update(editor, defect)
                if (!another) setEditor(null)
            }} />}
    </section>
}
