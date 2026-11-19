import axios from "axios"
import type { AxiosRequestConfig } from "axios"
import { getStoredSession, clearStoredSession } from "@/shared/session/sessionStorage"

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
})

function belongsToCurrentSession(config?: AxiosRequestConfig): boolean {
    const authorization = config?.headers?.Authorization
    return typeof authorization !== "string" || !authorization.startsWith("Bearer ")
        || authorization === `Bearer ${getStoredSession()?.token}`
}

api.interceptors.request.use((config) => {
    const token = getStoredSession()?.token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => {
        if (!belongsToCurrentSession(response.config)) throw new axios.CanceledError("La sesión cambió. Se descartó la respuesta anterior.")
        return response
    },
    (error) => {
        if (axios.isAxiosError(error) && !belongsToCurrentSession(error.config)) {
            return Promise.reject(new axios.CanceledError("La sesión cambió. Se descartó la respuesta anterior."))
        }
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            clearStoredSession()
            if (window.location.pathname !== "/login") {
                window.location.href = "/login"
            }
        }
        return Promise.reject(error)
    }
)

export default api
