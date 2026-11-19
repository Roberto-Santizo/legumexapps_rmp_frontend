import { Suspense } from "react"
import { Route } from "react-router-dom"
import PublicLayout from "@/app/layout/PublicLayout"
import { LoadingSpinner } from "@/shared/component/loadingSpinner.component"
import { authenticationRoutes } from "@/features/authentication/routes/authentication.routes"

export default function PublicRoutes() {
    return (
        <Route element={<Suspense fallback={<LoadingSpinner />}><PublicLayout /></Suspense>}>
            {authenticationRoutes.map(route => <Route key={route.path} path={route.path} element={route.element} />)}
        </Route>
    )
}
