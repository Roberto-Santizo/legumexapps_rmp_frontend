import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const CdpListView = lazy(() =>
    import("@/features/cdps/page/CdpListView.page").then((m) => ({ default: m.CdpListView }))
)

const CdpFormView = lazy(() =>
    import("@/features/cdps/page/CdpFormView.page").then((m) => ({ default: m.CdpFormView }))
)

export const cdpsRoutes: RouteObject[] = [
    { path: "/cdps", element: createElement(CdpListView) },
    { path: "/cdps/nuevo", element: createElement(CdpFormView) },
    { path: "/cdps/:id/editar", element: createElement(CdpFormView) },
]
