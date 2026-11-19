import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Modal } from "@/shared/component/modal.component"
import { FormField } from "@/shared/component/formField.component"
import { Input } from "@/shared/component/input.component"
import { Button } from "@/shared/component/button.component"
import { assignGrnApi } from "../api/rmReception.api"
import type { RmReception } from "../schema/rmReception.schema"
import { assignGrnFormSchema } from "../schema/rmReception.schema"
import { buildGrn } from "../utils/grn"

export function AssignGrnModal({ boleta, onClose }: { boleta: RmReception; onClose: () => void }) {
    if (!boleta.plant) return <Modal title={`Asignar GRN · Boleta #${boleta.id.toString().padStart(6, "0")}`} onClose={onClose}>
        <p role="alert" className="mb-5 text-sm text-error-fg">Esta recepción no tiene planta registrada. La planta se guarda automáticamente al completar la recepción.</p>
        <Button type="button" variant="secondary" onClick={onClose}>Cerrar</Button>
    </Modal>
    return <GrnForm boleta={boleta} onClose={onClose} />
}

function GrnForm({ boleta, onClose }: { boleta: RmReception; onClose: () => void }) {
    const field = boleta.fieldDataReceptions[0]
    const plant = boleta.plant!
    const queryClient = useQueryClient()
    const { register, watch, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(assignGrnFormSchema), defaultValues: { grnNumber: "" } })
    const grnPreview = assignGrnFormSchema.safeParse({ grnNumber: watch("grnNumber") })
    const mutation = useMutation({
        mutationFn: (data: { grnNumber: string }) => assignGrnApi({ id: boleta.id, grnNumber: data.grnNumber }),
        onSuccess: async result => {
            if (!result) return
            toast.success(result.message)
            queryClient.setQueryData(["rm-receptions", boleta.id], { data: result.data })
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["rm-receptions"] }), queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] })])
            onClose()
        },
        onError: error => toast.error(error.message),
    })
    return <Modal title={`Asignar GRN · Boleta #${boleta.id.toString().padStart(6, "0")}`} onClose={() => { if (!mutation.isPending) onClose() }}>
        <dl className="mb-5 grid gap-4 rounded-xl border border-border-light bg-bg-primary p-4 sm:grid-cols-2">
            <div className="min-w-0"><dt className="text-xs text-text-tertiary">Producto</dt><dd className="mt-1 break-words font-semibold text-dark">{field?.product.name ?? "—"}</dd></div>
            <div className="min-w-0"><dt className="text-xs text-text-tertiary">Variedad</dt><dd className="mt-1 break-words font-semibold text-dark">{field?.product.varietyProduct?.name ?? "—"}</dd></div>
        </dl>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))}>
            <p className="mb-4 font-semibold text-dark">Planta de recepción: {plant.name}</p>
            <FormField label="Número del GRN" htmlFor="assign-grn" required error={errors.grnNumber?.message}>
                <div className="flex items-center gap-3">
                    <span className="flex h-12 items-center rounded-xl border border-border-light bg-bg-primary px-4 font-semibold text-dark">{plant.code}00</span>
                    <Input id="assign-grn" type="text" inputMode="numeric" aria-required="true" aria-describedby="assign-grn-help assign-grn-preview" maxLength={251} placeholder="Ej. 80746" disabled={mutation.isPending} hasError={!!errors.grnNumber} {...register("grnNumber")} />
                </div>
                <p id="assign-grn-help" className="mt-2 text-sm text-text-tertiary">Ingresa solo el número. El prefijo {plant.code}00 se agrega automáticamente según la planta de recepción.</p>
                <p id="assign-grn-preview" className="mt-2 break-words text-sm text-dark" aria-live="polite">
                    {grnPreview.success && <>GRN a guardar: <strong>{buildGrn(plant.code, grnPreview.data.grnNumber)}</strong></>}
                </p>
            </FormField>
            <p className="mb-5 text-sm text-text-tertiary">Al asignarlo, la boleta quedará cerrada y se bloquearán las correcciones del equipo de calidad. El GRN no podrá modificarse. Las correcciones posteriores requieren autorización de edición excepcional.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" disabled={mutation.isPending} onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Asignando..." : "Asignar GRN y cerrar"}</Button>
            </div>
        </form>
    </Modal>
}
