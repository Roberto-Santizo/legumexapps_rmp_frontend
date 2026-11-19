import api from "@/shared/api/api"
import { manejarErrorApi } from "@/shared/api/manejarErrorApi"
import { loginResponseSchema } from "@/features/authentication/schema/authentication.schema"
import type { LoginInput } from "@/features/authentication/schema/authentication.schema"

export async function loginApi(formData: LoginInput) {
    try {
        const { data } = await api.post("/auth/login", formData)
        return loginResponseSchema.parse(data)
    } catch (error) {
        manejarErrorApi(error)
    }
}

export async function refreshSessionApi() {
    const { data } = await api.post("/auth/refresh")
    return loginResponseSchema.parse(data).data
}
