import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Modal } from "@/shared/component/modal.component"
import { FormField } from "@/shared/component/formField.component"
import { Select } from "@/shared/component/select.component"
import { FormActions } from "@/shared/component/formActions.component"
import { listCarriersApi } from "@/features/carriers/api/carrier.api"
import { assignCarrierRepresentativeApi } from "../api/user.api"
import type { User } from "../schema/user.schema"

export function CarrierRepresentativeModal({ user, onClose }: { user: User; onClose: () => void }) {
    const [carrierId, setCarrierId] = useState(String(user.representedCarrierId ?? ""))
    const queryClient = useQueryClient()
    const carriers = useQuery({ queryKey: ["carriers"], queryFn: () => listCarriersApi() })
    const save = useMutation({
        mutationFn: () => assignCarrierRepresentativeApi({ id: user.id, representedCarrierId: carrierId ? Number(carrierId) : null }),
        onSuccess: async result => {
            if (!result) return
            await queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("Asignación de representante guardada")
            onClose()
        },
    })
    return <Modal title={`Transportista representado · ${user.name}`} onClose={onClose} closeDisabled={save.isPending}>
        <form onSubmit={event => { event.preventDefault(); if (!save.isPending) save.mutate() }}>
            <p className="mb-4 text-sm text-text-tertiary">Asigna un solo representante del rol Campo por transportista. El rol también debe tener «Gestionar boletas del transportista asignado». Las correcciones respetan los permisos de cada apartado, su etapa y sus límites.</p>
            <FormField label="Transportista representado" htmlFor="represented-carrier" error={save.error?.message ?? carriers.error?.message}>
                <Select id="represented-carrier" value={carrierId} onChange={event => { setCarrierId(event.target.value); save.reset() }} disabled={save.isPending}>
                    <option value="">Ninguno: consultar únicamente sus propias boletas</option>
                    {user.representedCarrier && !carriers.data?.data.some(carrier => carrier.id === user.representedCarrierId)
                        && <option value={user.representedCarrier.id}>{user.representedCarrier.name}</option>}
                    {(carriers.data?.data ?? []).map(carrier => <option key={carrier.id} value={carrier.id}>{carrier.name}</option>)}
                </Select>
            </FormField>
            <FormActions onCancel={onClose} isPending={save.isPending} submitLabel="Guardar representante" />
        </form>
    </Modal>
}
