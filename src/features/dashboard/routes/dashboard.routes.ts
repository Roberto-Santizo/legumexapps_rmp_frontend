import { createElement, lazy } from "react"
import { AuthorizedHome } from "@/app/router/PermissionRoute"
import type { RouteObject } from "react-router-dom"

const Dashboard = lazy(() => import("../page/Dashboard.page").then(module => ({ default: module.Dashboard })))

export const dashboardRoutes: RouteObject[] = [
    { path: "/", element: createElement(AuthorizedHome) },
    { path: "/dashboard", element: createElement(Dashboard) },
]
