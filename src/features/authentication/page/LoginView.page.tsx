import { useState } from "react"
import { LegumexLogoStacked } from "@/shared/component/LegumexLogoStacked"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react"
import { loginSchema } from "@/features/authentication/schema/authentication.schema"
import type { LoginInput } from "@/features/authentication/schema/authentication.schema"
import { loginApi } from "@/features/authentication/api/authentication.api"
import { useAuthentication } from "@/features/authentication/hook/useAuthentication"
import { obtenerMensajeErrorCampo } from "@/shared/validacion/obtenerMensajeErrorCampo"

export function LoginPage() {
    const navigate = useNavigate()
    const { isAuthenticated, login } = useAuthentication()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    })

    const loginMutation = useMutation({
        mutationFn: loginApi,
        onSuccess: (result) => {
            if (!result) return
            login(result.data)
            navigate("/")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const onSubmit = handleSubmit((formData) => {
        loginMutation.mutate(formData)
    })

    if (isAuthenticated) return <Navigate to="/" replace />

    const isPending = loginMutation.isPending
    const usernameError = obtenerMensajeErrorCampo(errors.username)
    const passwordError = obtenerMensajeErrorCampo(errors.password)

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-slate-500/10 to-slate-600/10"></div>
                        <div className="relative">
                            <LegumexLogoStacked tone="inverse" className="legumex-logo-login" />
                            <h1 className="mt-5 text-sm font-medium text-slate-300">Recepción de materiales</h1>
                        </div>
                    </div>

                    <form className="px-8 py-8" onSubmit={onSubmit} autoComplete="on">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-1">Iniciar Sesión</h2>
                            <p className="text-sm text-slate-500">
                                Ingresa tus credenciales para continuar
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Usuario
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        disabled={isPending}
                                        className="pl-12 pr-4 py-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        {...register("username")}
                                    />
                                </div>
                                {usernameError && (
                                    <p className="mt-1.5 text-sm text-red-600">{usernameError}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={isPending}
                                        className="pl-12 pr-12 py-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isPending}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="mt-1.5 text-sm text-red-600">{passwordError}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full text-white font-semibold py-3.5 text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:hover:scale-100 bg-linear-to-r from-amber-500 via-amber-600 to-orange-600 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    © 2026 Legumex Apps. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}
