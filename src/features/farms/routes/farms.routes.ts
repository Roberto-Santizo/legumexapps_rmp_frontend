import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const FincaListView = lazy(() => import("../page/FincaListView.page").then(m => ({ default: m.FincaListView })))
const FincaFormView = lazy(() => import("../page/FincaFormView.page").then(m => ({ default: m.FincaFormView })))

export const farmsRoutes: RouteObject[] = [
    { path: "/fincas", element: createElement(FincaListView) },
    { path: "/fincas/nueva", element: createElement(FincaFormView) },
    { path: "/fincas/:id/editar", element: createElement(FincaFormView) },
]
