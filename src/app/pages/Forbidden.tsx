import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"
import { buttonClassName } from "@/shared/component/button.styles"

export default function Forbidden() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-bg text-error-fg">
                <ShieldAlert size={28} />
            </div>
            <h1 className="text-4xl font-semibold text-dark">403</h1>
            <p className="text-text-tertiary">No tienes permisos para acceder a esta sección</p>
            <Link to="/" className={buttonClassName("primary")}>
                Volver al inicio
            </Link>
        </div>
    )
}
