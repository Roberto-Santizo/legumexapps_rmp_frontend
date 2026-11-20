import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const UserListView = lazy(() =>
    import("@/features/users/page/UserListView.page").then((m) => ({ default: m.UserListView }))
)

const UserFormView = lazy(() =>
    import("@/features/users/page/UserFormView.page").then((m) => ({ default: m.UserFormView }))
)

export const usersRoutes: RouteObject[] = [
    { path: "/usuarios", element: createElement(UserListView) },
    { path: "/usuarios/nuevo", element: createElement(UserFormView) },
    { path: "/usuarios/:id/editar", element: createElement(UserFormView) },
]
