import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const VarietyProductListView = lazy(() =>
    import("@/features/varietyProducts/page/VarietyProductListView.page").then((m) => ({
        default: m.VarietyProductListView,
    }))
)

const VarietyProductFormView = lazy(() =>
    import("@/features/varietyProducts/page/VarietyProductFormView.page").then((m) => ({
        default: m.VarietyProductFormView,
    }))
)

export const varietyProductsRoutes: RouteObject[] = [
    { path: "/variedades", element: createElement(VarietyProductListView) },
    { path: "/variedades/nueva", element: createElement(VarietyProductFormView) },
    { path: "/variedades/:id/editar", element: createElement(VarietyProductFormView) },
]
