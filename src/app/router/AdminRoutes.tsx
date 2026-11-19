import { lazy, Suspense } from "react"
import { PermissionRoute } from "./PermissionRoute"
import { dashboardRoutes } from "@/features/dashboard/routes/dashboard.routes"
import { qualityEvaluationsRoutes } from "@/features/qualityEvaluations/routes/qualityEvaluations.routes"
import { Route } from "react-router-dom"
import { AppLayout } from "@/app/layout/AppLayout"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { ProtectedRoute } from "@/features/authentication/component/ProtectedRoute"
import { rolesRoutes } from "@/features/roles/routes/roles.routes"
import { usersRoutes } from "@/features/users/routes/users.routes"
import { rawMaterialReceptionsRoutes } from "@/features/rawMaterialReceptions/routes/rawMaterialReceptions.routes"
import { productsRoutes } from "@/features/products/routes/products.routes"
import { varietyProductsRoutes } from "@/features/varietyProducts/routes/varietyProducts.routes"
import { basketsRoutes } from "@/features/baskets/routes/baskets.routes"
import { carriersRoutes } from "@/features/carriers/routes/carriers.routes"
import { platesRoutes } from "@/features/plates/routes/plates.routes"
import { cdpsRoutes } from "@/features/cdps/routes/cdps.routes"
import { farmsRoutes } from "@/features/farms/routes/farms.routes"
import { producersRoutes } from "@/features/producers/routes/producers.routes"
import { needHelpRoutes } from "@/features/needHelp/routes/needHelp.routes"

const Forbidden     = lazy(() => import("@/app/pages/Forbidden"));

const NotFound      = lazy(() => import("@/app/pages/NotFound"));

const featureRoutes = [
    ...dashboardRoutes,
    ...qualityEvaluationsRoutes,
    ...rolesRoutes,
    ...usersRoutes,
    ...rawMaterialReceptionsRoutes,
    ...productsRoutes,
    ...varietyProductsRoutes,
    ...basketsRoutes,
    ...carriersRoutes,
    ...platesRoutes,
    ...cdpsRoutes,
    ...farmsRoutes,
    ...producersRoutes,
    ...needHelpRoutes,
]

export default function AdminRoutes() {
    return (
        <Route element={<ProtectedRoute />}>
            <Route element={<Suspense fallback={<LoadingSpinner />}><AppLayout /></Suspense>}>
                {featureRoutes.map(route => <Route key={route.path} path={route.path} element={<PermissionRoute path={route.path ?? ""}>{route.element}</PermissionRoute>} />)}
                <Route path="/403" element={<Forbidden />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Route>
    )
}
