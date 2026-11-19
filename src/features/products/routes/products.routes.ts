import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const ProductListView = lazy(() =>
    import("@/features/products/page/ProductListView.page").then((m) => ({ default: m.ProductListView }))
)

const ProductFormView = lazy(() =>
    import("@/features/products/page/ProductFormView.page").then((m) => ({ default: m.ProductFormView }))
)

export const productsRoutes: RouteObject[] = [
    { path: "/productos", element: createElement(ProductListView) },
    { path: "/productos/nuevo", element: createElement(ProductFormView) },
    { path: "/productos/:id/editar", element: createElement(ProductFormView) },
]
