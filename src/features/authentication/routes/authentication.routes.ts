import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const LoginPage = lazy(() => import("../page/LoginView.page").then(m => ({ default: m.LoginPage })))

export const authenticationRoutes: RouteObject[] = [
    { path: "/login", element: createElement(LoginPage) },
]
