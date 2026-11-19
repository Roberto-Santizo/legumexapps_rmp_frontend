import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const BasketListView = lazy(() =>
    import("@/features/baskets/page/BasketListView.page").then((m) => ({ default: m.BasketListView }))
)

const BasketFormView = lazy(() =>
    import("@/features/baskets/page/BasketFormView.page").then((m) => ({ default: m.BasketFormView }))
)

export const basketsRoutes: RouteObject[] = [
    { path: "/canastas", element: createElement(BasketListView) },
    { path: "/canastas/nueva", element: createElement(BasketFormView) },
    { path: "/canastas/:id/editar", element: createElement(BasketFormView) },
]
