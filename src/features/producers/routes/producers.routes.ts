import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const ProducerListView = lazy(() => import("../page/ProducerListView.page").then(m => ({ default: m.ProducerListView })))
const ProducerFormView = lazy(() => import("../page/ProducerFormView.page").then(m => ({ default: m.ProducerFormView })))

export const producersRoutes: RouteObject[] = [
    { path: "/productores", element: createElement(ProducerListView) },
    { path: "/productores/nuevo", element: createElement(ProducerFormView) },
    { path: "/productores/:id/editar", element: createElement(ProducerFormView) },
]
