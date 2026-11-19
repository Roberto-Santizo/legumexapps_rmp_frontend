import { Link } from "react-router-dom"
import { buttonClassName } from "@/shared/component/button.styles"

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-semibold text-dark">404</h1>
            <p className="text-text-tertiary">La página que buscas no existe</p>
            <Link to="/" className={buttonClassName("primary")}>
                Volver al inicio
            </Link>
        </div>
    )
}
