import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const CarrierListView = lazy(() =>
    import("@/features/carriers/page/CarrierListView.page").then((m) => ({ default: m.CarrierListView }))
)

const CarrierFormView = lazy(() =>
    import("@/features/carriers/page/CarrierFormView.page").then((m) => ({ default: m.CarrierFormView }))
)

export const carriersRoutes: RouteObject[] = [
    { path: "/transportistas", element: createElement(CarrierListView) },
    { path: "/transportistas/nuevo", element: createElement(CarrierFormView) },
    { path: "/transportistas/:id/editar", element: createElement(CarrierFormView) },
]
