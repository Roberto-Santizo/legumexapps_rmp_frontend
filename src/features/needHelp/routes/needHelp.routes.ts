import { createElement, lazy } from "react"
import type { RouteObject } from "react-router-dom"

const DoYouNeedHelp = lazy(() => import("@/features/needHelp/page/DoYouNeedHelp"));

export const needHelpRoutes: RouteObject[] = [
    { path: "/ayuda", element: createElement(DoYouNeedHelp) },
]
