import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const BoletaListView = lazy(() =>
    import("@/features/rawMaterialReceptions/page/BoletaListView.page").then((m) => ({ default: m.BoletaListView }))
)

const BoletaFormView = lazy(() =>
    import("@/features/rawMaterialReceptions/page/BoletaFormView.page").then((m) => ({ default: m.BoletaFormView }))
)

const ReceptionFormView = lazy(() =>
    import("@/features/rawMaterialReceptions/page/ReceptionFormView.page").then((m) => ({
        default: m.ReceptionFormView,
    }))
)

const BoletaPdfView = lazy(() =>
    import("@/features/rawMaterialReceptions/pdf/BoletaPdfView.page").then((m) => ({ default: m.BoletaPdfView }))
)
const ReceptionHistory = lazy(() => import("../page/ReceptionHistory.page").then(module => ({ default: module.ReceptionHistory })))

export const rawMaterialReceptionsRoutes: RouteObject[] = [
    { path: "/boletas", element: createElement(BoletaListView) },
    { path: "/boletas/nueva", element: createElement(BoletaFormView) },
    { path: "/boletas/:id/campo/editar", element: createElement(BoletaFormView) },
    { path: "/boletas/:id/recepcion", element: createElement(ReceptionFormView) },
    { path: "/boletas/:id/recepcion/editar", element: createElement(ReceptionFormView, { editing: true }) },
    { path: "/boletas/:id/pdf", element: createElement(BoletaPdfView) },
    { path: "/boletas/:id/historial", element: createElement(ReceptionHistory) },
]
