import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"
const QualityEvaluation = lazy(() => import("../page/QualityEvaluation.page").then(module => ({ default: module.QualityEvaluation })))
export const qualityEvaluationsRoutes: RouteObject[] = [
    { path: "/boletas/:id/calidad", element: createElement(QualityEvaluation) },
    { path: "/boletas/:id/calidad/editar", element: createElement(QualityEvaluation, { editing: true }) },
]
