import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const RoleListView = lazy(() =>
    import("@/features/roles/page/RoleListView.page").then((m) => ({ default: m.RoleListView }))
)

const RoleFormView = lazy(() =>
    import("@/features/roles/page/RoleFormView.page").then((m) => ({ default: m.RoleFormView }))
)

export const rolesRoutes: RouteObject[] = [
    { path: "/roles", element: createElement(RoleListView) },
    { path: "/roles/nuevo", element: createElement(RoleFormView) },
    { path: "/roles/:id/editar", element: createElement(RoleFormView) },
]
