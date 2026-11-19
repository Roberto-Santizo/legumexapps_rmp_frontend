import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Modal } from "@/shared/component/modal.component"
import { FormField } from "@/shared/component/formField.component"
import { Select } from "@/shared/component/select.component"
import { FormActions } from "@/shared/component/formActions.component"
import { listPlantsApi } from "@/features/plants/api/plant.api"
import { assignUserPlantApi } from "../api/user.api"
import type { User } from "../schema/user.schema"

export function UserPlantModal({ user, onClose }: { user: User; onClose: () => void }) {
    const [plantId, setPlantId] = useState(String(user.plantId ?? ""))
    const queryClient = useQueryClient()
    const plants = useQuery({ queryKey: ["plants"], queryFn: listPlantsApi })
    const save = useMutation({
        mutationFn: () => assignUserPlantApi({ id: user.id, plantId: plantId ? Number(plantId) : null }),
        onSuccess: async result => {
            if (!result) return
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["users"] }), queryClient.invalidateQueries({ queryKey: ["current-plant"] })])
            toast.success("Planta del usuario guardada")
            onClose()
        },
    })
    return <Modal title={`Planta · ${user.name}`} onClose={onClose} closeDisabled={save.isPending}>
        <form onSubmit={event => { event.preventDefault(); if (!save.isPending && !plants.isError && !plants.isLoading) save.mutate() }}>
            <FormField label="Planta del usuario" htmlFor="user-plant" error={save.error?.message ?? plants.error?.message}>
                <Select id="user-plant" value={plantId} onChange={event => { setPlantId(event.target.value); save.reset() }} disabled={save.isPending || plants.isLoading || plants.isError}>
                    <option value="">Sin planta asignada</option>
                    {(plants.data?.data ?? []).map(plant => <option key={plant.id} value={plant.id}>{plant.name} ({plant.code})</option>)}
                </Select>
                <p className="mt-2 text-sm text-text-tertiary">La planta se guardará en las nuevas recepciones de este usuario. Las boletas ya recibidas conservarán su planta. Sin planta asignada no podrá registrar recepciones.</p>
            </FormField>
            <FormActions onCancel={onClose} isPending={save.isPending} submitDisabled={plants.isLoading || plants.isError} submitLabel="Guardar planta" />
        </form>
    </Modal>
}
