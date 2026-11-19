import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import {
    esquemaRespuestaLista,
    esquemaRespuestaListaPaginada,
    esquemaRespuestaItem,
    esquemaRespuestaMutacion,
    esquemaRespuestaMensaje,
} from "@/shared/api/respuestaApi.esquema"
import { roleSchema } from "@/features/roles/schema/role.schema"
import { permissionSchema } from "../schema/permission.schema"

const listaRolesSchema = esquemaRespuestaLista(roleSchema)
const listaRolesPaginadaSchema = esquemaRespuestaListaPaginada(roleSchema)
const rolSchema = esquemaRespuestaItem(roleSchema)
const mutacionRolSchema = esquemaRespuestaMutacion(roleSchema)
const listaPermisosDelRolSchema = esquemaRespuestaLista(permissionSchema)

export async function listRolesApi(search?: string) {
    try {
        const { data } = await api.get("/roles", { params: { all: true, ...(search ? { search } : {}) } })
        return listaRolesSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listRolesWithFiltersApi({ page, search }: { page?: number; search?: string } = {}) {
    try {
        const { data } = await api.get("/roles", { params: { page, search: search || undefined } })
        return listaRolesPaginadaSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getRoleApi(id: number) {
    try {
        const { data } = await api.get(`/roles/${id}`)
        return rolSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function createRoleApi(payload: { name: string; permissionIds: number[] }) {
    try {
        const { data } = await api.post("/roles", payload)
        return mutacionRolSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function updateRoleApi({ id, ...payload }: { id: number; name: string; permissionIds: number[] }) {
    try {
        const { data } = await api.patch(`/roles/${id}`, payload)
        return mutacionRolSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function deleteRoleApi(id: number) {
    try {
        const { data } = await api.delete(`/roles/${id}`)
        return esquemaRespuestaMensaje.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function getRolePermissionsApi(roleId: number) {
    try {
        const { data } = await api.get(`/roles/${roleId}/permissions`)
        return listaPermisosDelRolSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function listPermissionCatalogApi() {
    try {
        const { data } = await api.get("/roles/permission-catalog")
        return listaPermisosDelRolSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}
