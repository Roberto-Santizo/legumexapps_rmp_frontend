import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { esquemaRespuestaItem, esquemaRespuestaLista, esquemaRespuestaListaPaginada, esquemaRespuestaMutacion } from "@/shared/api/respuestaApi.esquema"
import { userSchema } from "@/features/users/schema/user.schema"
import type { CreateUserPayload, UpdateUserPayload } from "@/features/users/schema/user.schema"

const listaUsuariosSchema = esquemaRespuestaLista(userSchema)
const listaUsuariosPaginadaSchema = esquemaRespuestaListaPaginada(userSchema)
const mutacionUsuarioSchema = esquemaRespuestaMutacion(userSchema)
const usuarioSchema = esquemaRespuestaItem(userSchema)

export async function getUserApi(id: number) {
    try {
        const { data } = await api.get(`/users/${id}`)
        return usuarioSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function updateUserApi({ id, ...payload }: UpdateUserPayload & { id: number }) {
    try {
        const { data } = await api.patch(`/users/${id}`, payload)
        return mutacionUsuarioSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function listUsersApi(search?: string) {
    try {
        const { data } = await api.get("/users", { params: { all: true, ...(search ? { search } : {}) } })
        return listaUsuariosSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listUsersWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/users", { params: { page, search: search || undefined } })
        return listaUsuariosPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createUserApi(payload: CreateUserPayload) {
    try {
        const { data } = await api.post("/users", payload)
        return mutacionUsuarioSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function assignCarrierRepresentativeApi({ id, representedCarrierId }: { id: number; representedCarrierId: number | null }) {
    try {
        const { data } = await api.patch(`/users/${id}`, { representedCarrierId })
        return mutacionUsuarioSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function assignUserPlantApi({ id, plantId }: { id: number; plantId: number | null }) {
    try {
        const { data } = await api.patch(`/users/${id}`, { plantId })
        return mutacionUsuarioSchema.parse(data)
    } catch (error) { manejarErrorApi(error) }
}

export async function toggleUserEstadoApi({ id, activo }: { id: number; activo: boolean }) {
    try {
        const { data } = await api.patch(`/users/${id}/status`, { activo })
        return mutacionUsuarioSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}
