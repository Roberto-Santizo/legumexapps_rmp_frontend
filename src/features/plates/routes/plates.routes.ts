import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const PlateListView = lazy(() =>
    import("@/features/plates/page/PlateListView.page").then((m) => ({ default: m.PlateListView }))
)

const PlateFormView = lazy(() =>
    import("@/features/plates/page/PlateFormView.page").then((m) => ({ default: m.PlateFormView }))
)

export const platesRoutes: RouteObject[] = [
    { path: "/placas", element: createElement(PlateListView) },
    { path: "/placas/nueva", element: createElement(PlateFormView) },
    { path: "/placas/:id/editar", element: createElement(PlateFormView) },
]
